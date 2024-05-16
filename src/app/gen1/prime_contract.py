import func
import prime_config

from pyteal import *
from beaker import *
from typing import *


class Config1:
    def __init__(self):
        self.key = Bytes("Config1")
        self.id = func.GlobalUint(self.key, 0, 4)
        self.parent_id = func.GlobalUint(self.key, 4, 4)
        self.prime_asset_id = func.GlobalUint(self.key, 8, 8)
        self.legacy_asset_id = func.GlobalUint(self.key, 16, 8)
        self.theme = func.GlobalUint(self.key, 24, 2)
        self.skin = func.GlobalUint(self.key, 26, 2)
        self.is_founder = func.GlobalUint(self.key, 28, 1)
        self.is_artifact = func.GlobalUint(self.key, 29, 1)
        self.is_pioneer = func.GlobalUint(self.key, 30, 1)
        self.is_explorer = func.GlobalUint(self.key, 31, 1)
        self.score = func.GlobalUint(self.key, 32, 8)
        self.renames = func.GlobalUint(self.key, 40, 8)
        self.repaints = func.GlobalUint(self.key, 48, 8)
        self.sales = func.GlobalUint(self.key, 56, 8)
        self.price = func.GlobalUint(self.key, 64, 8)
        self.seller = func.GlobalBytes(self.key, 72, 32)
        self.name = func.GlobalBytes(self.key, 104, 8)


class Config2:
    def __init__(self):
        self.key = Bytes("Config2")
        self.description = func.GlobalBytes(self.key, 0, 64)


app = Application("GenOnePrime")

config1 = Config1()
config2 = Config2()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(config1.key),
        func.init_global(config2.key),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="initialize")
def initialize(
    id: abi.Uint64,
    parent_id: abi.Uint64,
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
    platform_asset: abi.Asset,
):
    return Seq(
        func.assert_is_creator(),
        func.assert_is_equal(platform_asset.asset_id(), prime_config.platform_asset_id),
        config1.id.set(id.get()),
        config1.parent_id.set(parent_id.get()),
        config1.prime_asset_id.set(prime_asset.asset_id()),
        config1.legacy_asset_id.set(legacy_asset.asset_id()),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
        func.optin_into_asset(platform_asset.asset_id()),
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
):
    return Seq(
        func.assert_is_creator(),
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
        config1.is_founder.set(is_founder.get()),
        config1.is_artifact.set(is_artifact.get()),
        config1.is_pioneer.set(is_pioneer.get()),
        config1.is_explorer.set(is_explorer.get()),
        config1.name.set(name.get()),
    )


@app.external(name="finalize")
def finalize(
    score: abi.Uint64,
    renames: abi.Uint64,
    repaints: abi.Uint64,
    sales: abi.Uint64,
):
    return Seq(
        func.assert_is_creator(),
        config1.score.set(score.get()),
        config1.renames.set(renames.get()),
        config1.repaints.set(repaints.get()),
        config1.sales.set(sales.get()),
    )


@app.external(name="rename")
def rename(
    name: abi.StaticBytes[Literal[8]],
):
    return Seq(
        config1.name.set(name.get()),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
):
    return Seq(
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    seller: abi.Account,
):
    return Seq(
        func.assert_is_zero_int(config1.price.get()),
        func.assert_is_zero_address(config1.seller.get()),
        func.assert_is_positive_int(price.get()),
        func.assert_is_positive_address(seller.address()),
        config1.price.set(price.get()),
        config1.seller.set(seller.address()),
    )


@app.external(name="unlist")
def unlist():
    return Seq(
        func.assert_is_positive_int(config1.price.get()),
        func.assert_is_positive_address(config1.seller.get()),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(), config1.seller.get(), Int(1)
        ),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
    )


@app.external(name="buy")
def buy(
    buyer: abi.Account,
):
    return Seq(
        func.assert_is_positive_int(config1.price.get()),
        func.assert_is_positive_address(config1.seller.get()),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
    )
