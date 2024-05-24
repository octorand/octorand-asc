import func
import gen1_const as const

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrime")

config1 = const.Config1()
config2 = const.Config2()


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
        Assert(Txn.sender() == const.admin_address),
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
        Assert(Txn.sender() == const.admin_address),
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
        Assert(Txn.sender() == const.admin_address),
        config1.score.set(score.get()),
        config1.sales.set(sales.get()),
        config1.mints.set(mints.get()),
        config1.renames.set(renames.get()),
        config1.repaints.set(repaints.get()),
    )
