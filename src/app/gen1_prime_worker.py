import func
import gen1_const as const

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeWorker")

config1 = const.Config1()
config2 = const.Config2()


@app.update(bare=True)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
):
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.execute_asset_transfer(
            const.platform_asset_id,
            Txn.sender(),
            amount.get(),
        ),
        config1.mints.increment(Int(1)),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
):
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.execute_payment(
            Txn.sender(),
            amount.get(),
        ),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
):
    return Seq(
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.get()),
        Assert(asset.asset_id() != config1.legacy_asset_id.get()),
        func.assert_sender_payment(
            Global.current_application_address(),
            const.optin_price,
            Add(Txn.group_index(), Int(1)),
        ),
        func.optin_into_asset(asset.asset_id()),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
):
    return Seq(
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.get()),
        Assert(asset.asset_id() != config1.legacy_asset_id.get()),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.optout_from_asset(asset.asset_id(), Txn.sender()),
    )
