import func
import gen1_const as const
import gen1_prime_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeMain")

config1 = const.Config1()
config2 = const.Config2()


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="initialize")
def initialize(
    id: abi.Uint64,
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
    application: abi.Application,
):
    return Seq(
        func.assert_application_creator(
            application.application_id(), const.manager_address
        ),
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=application.application_id(),
            method_signature=storage.initialize.method_signature(),
            args=[
                id,
                prime_asset,
                legacy_asset,
            ],
        ),
    )


@app.external(name="populate")
def populate(
    theme: abi.Uint64,
    skin: abi.Uint64,
    is_founder: abi.Uint64,
    is_artifact: abi.Uint64,
    is_pioneer: abi.Uint64,
    is_explorer: abi.Uint64,
    name: abi.StaticBytes[Literal[8]],
    description: abi.StaticBytes[Literal[64]],
    application: abi.Application,
):
    return Seq(
        func.assert_application_creator(
            application.application_id(), const.manager_address
        ),
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=application.application_id(),
            method_signature=storage.populate.method_signature(),
            args=[
                theme,
                skin,
                is_founder,
                is_artifact,
                is_pioneer,
                is_explorer,
                name,
                description,
            ],
        ),
    )


@app.external(name="finalize")
def finalize(
    score: abi.Uint64,
    sales: abi.Uint64,
    mints: abi.Uint64,
    renames: abi.Uint64,
    repaints: abi.Uint64,
    application: abi.Application,
):
    return Seq(
        func.assert_application_creator(
            application.application_id(), const.manager_address
        ),
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=application.application_id(),
            method_signature=storage.finalize.method_signature(),
            args=[
                score,
                sales,
                mints,
                renames,
                repaints,
            ],
        ),
    )


@app.external(name="upgrade")
def upgrade(
    application: abi.Application,
):
    return Seq(
        func.assert_application_creator(
            application.application_id(), const.manager_address
        ),
        Assert(config1.is_explorer.external(application.application_id()) == Int(0)),
        func.assert_sender_asset_transfer(
            config1.legacy_asset_id.external(application.application_id()),
            func.get_application_address(application.application_id()),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=application.application_id(),
            method_signature=storage.upgrade.method_signature(),
            args=[
                Txn.sender(),
            ],
        ),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    application: abi.Application,
):
    return Seq(
        func.assert_application_creator(
            application.application_id(), const.manager_address
        ),
        Assert(
            config1.seller.external(application.application_id())
            == Global.zero_address()
        ),
        Assert(config1.price.external(application.application_id()) == Int(0)),
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            config1.prime_asset_id.external(application.application_id()),
            func.get_application_address(application.application_id()),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=application.application_id(),
            method_signature=storage.list.method_signature(),
            args=[
                price,
                Txn.sender(),
            ],
        ),
    )
