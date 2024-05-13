from pyteal import *

max_storage_length = Int(120)


class GlobalUint:
    def __init__(self, index, start, length):
        self.index = index
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        return get_global_uint(self.index, self.start, self.length)

    def set(self, value):
        return set_global_uint(value, self.index, self.start, self.length)

    def increment(self, value):
        result = Add(self.get(), value)
        return set_global_uint(result, self.index, self.start, self.length)

    def decrement(self, value):
        result = Minus(self.get(), value)
        return set_global_uint(result, self.index, self.start, self.length)


class GlobalBytes:
    def __init__(self, index, start, length):
        self.index = index
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        return get_global_bytes(self.index, self.start, self.length)

    def set(self, value):
        return set_global_bytes(value, self.index, self.start, self.length)


@Subroutine(TealType.none)
def init_global(index):
    return Seq(
        App.globalPut(index, BytesZero(max_storage_length)),
    )


@Subroutine(TealType.bytes)
def get_global_bytes(index, start, length):
    return Seq(
        Extract(App.globalGet(index), start, length),
    )


@Subroutine(TealType.uint64)
def get_global_uint(index, start, length):
    return Seq(
        Btoi(get_global_bytes(index, start, length)),
    )


@Subroutine(TealType.none)
def set_global_bytes(value, index, start, length):
    end = Add(start, length)
    param_1 = get_global_bytes(index, Int(0), start)
    param_2 = get_global_bytes(index, end, Minus(max_storage_length, end))
    return Seq(
        assert_is_valid_length(value, length),
        App.globalPut(index, Concat(param_1, value, param_2)),
    )


@Subroutine(TealType.none)
def set_global_uint(value, index, start, length):
    return Seq(
        set_global_bytes(extract_uint(value, length), index, start, length),
    )


@Subroutine(TealType.bytes)
def extract_uint(value, length):
    return Seq(
        Extract(Itob(value), Minus(Int(8), length), length),
    )


@Subroutine(TealType.none)
def create_application(
    approval, clear, global_uints, global_bytes, local_units, local_bytes, pages, fee
):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.on_completion: OnComplete.NoOp,
                TxnField.approval_program: approval,
                TxnField.clear_state_program: clear,
                TxnField.global_num_uints: global_uints,
                TxnField.global_num_byte_slices: global_bytes,
                TxnField.local_num_uints: local_units,
                TxnField.local_num_byte_slices: local_bytes,
                TxnField.extra_program_pages: pages,
                TxnField.fee: fee,
            }
        )
    )


@Subroutine(TealType.none)
def update_application(app_id, approval, clear, fee):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.on_completion: OnComplete.UpdateApplication,
                TxnField.application_id: app_id,
                TxnField.approval_program: approval,
                TxnField.clear_state_program: clear,
                TxnField.fee: fee,
            }
        )
    )


@Subroutine(TealType.none)
def delete_application(app_id, fee):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.on_completion: OnComplete.DeleteApplication,
                TxnField.application_id: app_id,
                TxnField.fee: fee,
            }
        )
    )


@Subroutine(TealType.none)
def create_asset(
    manager, reserve, total, decimals, unit_name, asset_name, asset_url, fee
):
    return Seq(
        Assert(manager != Global.zero_address()),
        Assert(reserve != Global.zero_address()),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetConfig,
                TxnField.config_asset_manager: manager,
                TxnField.config_asset_reserve: reserve,
                TxnField.config_asset_total: total,
                TxnField.config_asset_decimals: decimals,
                TxnField.config_asset_unit_name: unit_name,
                TxnField.config_asset_name: asset_name,
                TxnField.config_asset_url: asset_url,
                TxnField.config_asset_default_frozen: Int(0),
                TxnField.fee: fee,
            }
        ),
    )


@Subroutine(TealType.none)
def update_asset(asset_id, manager, reserve, note, fee):
    return Seq(
        Assert(manager != Global.zero_address()),
        Assert(reserve != Global.zero_address()),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetConfig,
                TxnField.config_asset: asset_id,
                TxnField.config_asset_manager: manager,
                TxnField.config_asset_reserve: reserve,
                TxnField.note: note,
                TxnField.fee: fee,
            }
        ),
    )


@Subroutine(TealType.none)
def optin_into_asset(asset_id, fee):
    return Seq(
        If(asset_id > Int(0)).Then(
            InnerTxnBuilder.Execute(
                {
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: asset_id,
                    TxnField.asset_amount: Int(0),
                    TxnField.asset_receiver: Global.current_application_address(),
                    TxnField.fee: fee,
                }
            )
        )
    )


@Subroutine(TealType.none)
def optout_from_asset(asset_id, receiver, fee):
    return Seq(
        If(asset_id > Int(0)).Then(
            InnerTxnBuilder.Execute(
                {
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: asset_id,
                    TxnField.asset_amount: Int(0),
                    TxnField.asset_receiver: receiver,
                    TxnField.asset_close_to: receiver,
                    TxnField.fee: fee,
                }
            )
        )
    )


@Subroutine(TealType.none)
def execute_payment(receiver, amount, fee):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: receiver,
                TxnField.amount: amount,
                TxnField.fee: fee,
            }
        )
    )


@Subroutine(TealType.none)
def execute_asset_transfer(asset_id, receiver, amount, fee):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset_id,
                TxnField.asset_receiver: receiver,
                TxnField.asset_amount: amount,
                TxnField.fee: fee,
            }
        )
    )


@Subroutine(TealType.none)
def assert_is_creator():
    return Seq(
        Assert(Txn.sender() == Global.creator_address()),
    )


@Subroutine(TealType.none)
def assert_is_zero(value):
    return Seq(
        Assert(value == Int(0)),
    )


@Subroutine(TealType.none)
def assert_is_equal(first, second):
    return Seq(
        Assert(first == second),
    )


@Subroutine(TealType.none)
def assert_is_positive(value):
    return Seq(
        Assert(value > Int(0)),
    )


@Subroutine(TealType.none)
def assert_is_valid_length(value, length):
    return Seq(
        Assert(Len(value) == length),
    )


@Subroutine(TealType.none)
def assert_is_future(timestamp):
    return Seq(
        Assert(timestamp > Global.latest_timestamp()),
    )


@Subroutine(TealType.none)
def assert_is_past(timestamp):
    return Seq(
        Assert(timestamp < Global.latest_timestamp()),
    )


@Subroutine(TealType.none)
def assert_is_direct():
    return Seq(
        Assert(Global.caller_app_id() == Int(0)),
    )
