import func
import gen1_const as const
import gen1_contract_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOneVault")

prime = const.Prime()


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "optin(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        func.assert_sender_payment(
            func.get_application_address(app_id),
            const.optin_price,
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optin.method_signature(),
            args=[
                asset,
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "optout(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optout.method_signature(),
            args=[
                asset,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )
