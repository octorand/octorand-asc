import func
import prime_config

from pyteal import *
from beaker import *
from typing import *


class Prime:
    def __init__(self):
        self.key = Bytes("Prime")
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
        self.price = func.GlobalUint(self.key, 40, 8)
        self.seller = func.GlobalBytes(self.key, 48, 32)
        self.name = func.GlobalBytes(self.key, 80, 8)


app = Application("GenOnePrime")

prime = Prime()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(prime.key),
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
        prime.id.set(id.get()),
        prime.parent_id.set(parent_id.get()),
        prime.prime_asset_id.set(prime_asset.asset_id()),
        prime.legacy_asset_id.set(legacy_asset.asset_id()),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
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
    score: abi.Uint64,
    name: abi.StaticBytes[Literal[8]],
):
    return Seq(
        func.assert_is_creator(),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.is_founder.set(is_founder.get()),
        prime.is_artifact.set(is_artifact.get()),
        prime.is_pioneer.set(is_pioneer.get()),
        prime.is_explorer.set(is_explorer.get()),
        prime.score.set(score.get()),
        prime.name.set(name.get()),
    )


@app.external(name="rename")
def rename(
    name: abi.StaticBytes[Literal[8]],
):
    return Seq(
        prime.name.set(name.get()),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
):
    return Seq(
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    seller: abi.Account,
):
    return Seq(
        func.assert_is_zero_int(prime.price.get()),
        func.assert_is_zero_address(prime.seller.get()),
        func.assert_is_positive_int(price.get()),
        func.assert_is_positive_address(seller.address()),
        prime.price.set(price.get()),
        prime.seller.set(seller.address()),
    )


@app.external(name="unlist")
def unlist():
    return Seq(
        func.assert_is_positive_int(prime.price.get()),
        func.assert_is_positive_address(prime.seller.get()),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(), prime.seller.get(), Int(1)
        ),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
    )


@app.external(name="buy")
def buy(
    buyer: abi.Account,
):
    return Seq(
        func.assert_is_positive_int(prime.price.get()),
        func.assert_is_positive_address(prime.seller.get()),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
    )
