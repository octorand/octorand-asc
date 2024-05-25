import func
import gen1_const as const

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeStorage")

config1 = const.Config1()
config2 = const.Config2()


@Subroutine(TealType.none)
def assert_application_caller():
    return Seq(
        Assert(Global.caller_app_id() == const.main_application_id),
    )


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(config1.key),
        func.init_global(config2.key),
    )


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
):
    return Seq(
        assert_application_caller(),
        config1.id.set(id.get()),
        config1.prime_asset_id.set(prime_asset.asset_id()),
        config1.legacy_asset_id.set(legacy_asset.asset_id()),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
        func.optin_into_asset(const.platform_asset_id),
        func.optin_into_asset(prime_asset.asset_id()),
        func.optin_into_asset(legacy_asset.asset_id()),
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
):
    return Seq(
        assert_application_caller(),
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
        config1.is_founder.set(is_founder.get()),
        config1.is_artifact.set(is_artifact.get()),
        config1.is_pioneer.set(is_pioneer.get()),
        config1.is_explorer.set(is_explorer.get()),
        config1.name.set(name.get()),
        config2.description.set(description.get()),
    )


@app.external(name="finalize")
def finalize(
    score: abi.Uint64,
    sales: abi.Uint64,
    mints: abi.Uint64,
    renames: abi.Uint64,
    repaints: abi.Uint64,
):
    return Seq(
        assert_application_caller(),
        config1.score.set(score.get()),
        config1.sales.set(sales.get()),
        config1.mints.set(mints.get()),
        config1.renames.set(renames.get()),
        config1.repaints.set(repaints.get()),
    )


@app.external(name="upgrade")
def upgrade(
    owner: abi.Address,
):
    return Seq(
        assert_application_caller(),
        Assert(config1.is_explorer.get() == Int(0)),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            owner.get(),
            Int(1),
        ),
        config1.is_explorer.set(Int(1)),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    seller: abi.Address,
):
    return Seq(
        assert_application_caller(),
        Assert(config1.seller.get() == Global.zero_address()),
        Assert(config1.price.get() == Int(0)),
        config1.price.set(price.get()),
        config1.seller.set(seller.get()),
    )


@app.external(name="unlist")
def unlist(
    seller: abi.Address,
):
    return Seq(
        assert_application_caller(),
        Assert(config1.price.get() > Int(0)),
        Assert(config1.seller.get() == seller.get()),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            seller.get(),
            Int(1),
        ),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
    )


@app.external(name="buy")
def buy(
    buyer: abi.Address,
):
    return Seq(
        assert_application_caller(),
        Assert(config1.price.get() > Int(0)),
        Assert(config1.seller.get() != Global.zero_address()),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            buyer.get(),
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
    return Seq(
        assert_application_caller(),
        config1.name.set(SetByte(config1.name.get(), index.get(), value.get())),
        config1.renames.increment(Int(1)),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
):
    return Seq(
        assert_application_caller(),
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
        config1.repaints.increment(Int(1)),
    )


@app.external(name="describe")
def describe(
    description: abi.StaticBytes[Literal[64]],
):
    return Seq(
        assert_application_caller(),
        config2.description.set(description.get()),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
    owner: abi.Address,
):
    return Seq(
        assert_application_caller(),
        func.execute_asset_transfer(
            const.platform_asset_id,
            owner.get(),
            amount.get(),
        ),
        config1.mints.increment(Int(1)),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
    owner: abi.Address,
):
    return Seq(
        assert_application_caller(),
        func.execute_payment(
            owner.get(),
            amount.get(),
        ),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
):
    return Seq(
        assert_application_caller(),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.get()),
        Assert(asset.asset_id() != config1.legacy_asset_id.get()),
        func.optin_into_asset(asset.asset_id()),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
    owner: abi.Address,
):
    return Seq(
        assert_application_caller(),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.get()),
        Assert(asset.asset_id() != config1.legacy_asset_id.get()),
        func.optout_from_asset(asset.asset_id(), owner.get()),
    )
