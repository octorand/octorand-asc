from pyteal import *

max_storage_length = Int(120)
max_logs_length = Int(240)


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

    def external(self, application):
        return get_global_external_uint(
            application, self.index, self.start, self.length
        )


class GlobalBytes:
    def __init__(self, index, start, length):
        self.index = index
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        return get_global_bytes(self.index, self.start, self.length)

    def set(self, value):
        return set_global_bytes(value, self.index, self.start, self.length)

    def external(self, application):
        return get_global_external_bytes(
            application, self.index, self.start, self.length
        )


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
    param_1 = Extract(App.globalGet(index), Int(0), start)
    param_2 = Substring(App.globalGet(index), Add(start, length), max_storage_length)
    return Seq(
        Assert(Len(value) == length),
        App.globalPut(index, Concat(param_1, value, param_2)),
    )


@Subroutine(TealType.none)
def set_global_uint(value, index, start, length):
    pack = Extract(Itob(value), Minus(Int(8), length), length)
    return Seq(
        set_global_bytes(pack, index, start, length),
    )


@Subroutine(TealType.bytes)
def get_global_external_bytes(application, index, start, length):
    value = App.globalGetEx(application, index)
    return Seq(
        value,
        Assert(value.hasValue()),
        Extract(value.value(), start, length),
    )


@Subroutine(TealType.uint64)
def get_global_external_uint(application, index, start, length):
    return Seq(
        Btoi(get_global_external_bytes(application, index, start, length)),
    )


@Subroutine(TealType.bytes)
def get_application_address(application_id):
    address = AppParam.address(application_id)
    return Seq(
        address,
        Assert(address.hasValue()),
        address.value(),
    )


@Subroutine(TealType.bytes)
def get_asset_reserve(asset_id):
    asset = AssetParam.reserve(asset_id)
    return Seq(
        asset,
        Assert(asset.hasValue()),
        asset.value(),
    )


@Subroutine(TealType.bytes)
def prepare_log(log):
    return Seq(
        Concat(
            log,
            BytesZero(Minus(max_logs_length, Len(log))),
        ),
    )


@Subroutine(TealType.none)
def optin_into_asset(asset_id):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset_id,
                TxnField.asset_amount: Int(0),
                TxnField.asset_receiver: Global.current_application_address(),
                TxnField.fee: Int(0),
            }
        )
    )


@Subroutine(TealType.none)
def optout_from_asset(asset_id, receiver):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset_id,
                TxnField.asset_amount: Int(0),
                TxnField.asset_receiver: receiver,
                TxnField.asset_close_to: receiver,
                TxnField.fee: Int(0),
            }
        )
    )


@Subroutine(TealType.none)
def execute_payment(receiver, amount):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: receiver,
                TxnField.amount: amount,
                TxnField.fee: Int(0),
            }
        )
    )


@Subroutine(TealType.none)
def execute_asset_transfer(asset_id, receiver, amount):
    return Seq(
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset_id,
                TxnField.asset_receiver: receiver,
                TxnField.asset_amount: amount,
                TxnField.fee: Int(0),
            }
        )
    )


@Subroutine(TealType.none)
def assert_sender_asset_holding(asset_id):
    balance = AssetHolding.balance(Txn.sender(), asset_id)
    return Seq(
        balance,
        Assert(balance.hasValue()),
        Assert(balance.value() > Int(0)),
    )


@Subroutine(TealType.none)
def assert_sender_payment(receiver, amount, index):
    return Seq(
        Assert(amount > Int(0)),
        Assert(Gtxn[index].sender() == Txn.sender()),
        Assert(Gtxn[index].type_enum() == TxnType.Payment),
        Assert(Gtxn[index].receiver() == receiver),
        Assert(Gtxn[index].amount() == amount),
    )


@Subroutine(TealType.none)
def assert_sender_asset_transfer(asset_id, receiver, amount, index):
    return Seq(
        Assert(amount > Int(0)),
        Assert(Gtxn[index].sender() == Txn.sender()),
        Assert(Gtxn[index].type_enum() == TxnType.AssetTransfer),
        Assert(Gtxn[index].xfer_asset() == asset_id),
        Assert(Gtxn[index].asset_receiver() == receiver),
        Assert(Gtxn[index].asset_amount() == amount),
    )


@Subroutine(TealType.none)
def assert_application_creator(application_id, address):
    creator = AppParam.creator(application_id)
    return Seq(
        creator,
        Assert(creator.hasValue()),
        Assert(creator.value() == address),
    )
