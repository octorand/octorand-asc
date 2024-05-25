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


@app.external(name="buy")
def buy():
    return Seq(
        Assert(config1.price.get() > Int(0)),
        Assert(config1.seller.get() != Global.zero_address()),
        func.assert_sender_payment(
            config1.seller.get(),
            Div(Mul(config1.price.get(), const.seller_market_share), Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_payment(
            const.admin_address,
            Div(Mul(config1.price.get(), const.admin_market_share), Int(100)),
            Add(Txn.group_index(), Int(2)),
        ),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            Txn.sender(),
            Int(1),
        ),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
        config1.sales.increment(Int(1)),
    )


@app.external(name="rename")
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
):
    previous_value = GetByte(config1.name.get(), index.get())
    next_value = value.get()
    value_difference = If(
        Gt(next_value, previous_value),
        Minus(next_value, previous_value),
        Minus(previous_value, next_value),
    )
    price = Mul(const.rename_price, value_difference)
    return Seq(
        Assert(index.get() <= Int(7)),
        Assert(value.get() >= Int(65)),
        Assert(value.get() <= Int(90)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            price,
            Add(Txn.group_index(), Int(1)),
        ),
        config1.name.set(SetByte(config1.name.get(), index.get(), value.get())),
        config1.renames.increment(Int(1)),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
):
    return Seq(
        Assert(theme.get() <= Int(7)),
        Assert(skin.get() <= Int(7)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            const.repaint_price,
            Add(Txn.group_index(), Int(1)),
        ),
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
        config1.repaints.increment(Int(1)),
    )


@app.external(name="describe")
def describe(
    description: abi.StaticBytes[Literal[64]],
):
    return Seq(
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            const.describe_price,
            Add(Txn.group_index(), Int(1)),
        ),
        config2.description.set(description.get()),
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
