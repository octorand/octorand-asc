import func
import gen1_const as const
import gen1_contract_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOneMarket")

prime = const.Prime()


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "list(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(price.get()),
    )
    return Seq(
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            prime.prime_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.list.method_signature(),
            args=[
                price,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="unlist")
def unlist(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "unlist(uint64,uint64,uint64,address)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.unlist.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="buy")
def buy(
    application: abi.Application,
):
    app_id = application.application_id()
    seller_share = Mul(prime.price.external(app_id), const.seller_market_share)
    admin_share = Mul(prime.price.external(app_id), const.admin_market_share)
    log = Concat(
        MethodSignature(
            "buy(uint64,uint64,uint64,address,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        prime.seller.external(app_id),
        Itob(prime.price.external(app_id)),
    )
    return Seq(
        func.assert_sender_payment(
            prime.seller.external(app_id),
            Div(seller_share, Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_payment(
            const.admin_address,
            Div(admin_share, Int(100)),
            Add(Txn.group_index(), Int(2)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.buy.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )
