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
