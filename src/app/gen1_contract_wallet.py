import func
import gen1_const as const
import gen1_contract_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOneWallet")

prime = const.Prime()


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="upgrade")
def upgrade(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "upgrade(uint64,uint64,uint64,address)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        func.assert_sender_asset_transfer(
            prime.legacy_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.upgrade.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "mint(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.mint.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "withdraw(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.withdraw.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )
