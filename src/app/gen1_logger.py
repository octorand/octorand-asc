import func
import gen1_const as const

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOneLogger")


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="buy")
def buy(
    timestamp: abi.Uint64,
    id: abi.Uint64,
    price: abi.Uint64,
    seller: abi.Account,
    buyer: abi.Account,
):
    return Seq(
        Log(Bytes("buy")),
    )
