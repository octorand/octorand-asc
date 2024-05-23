import func
import prime_config

from pyteal import *
from beaker import *
from typing import *


class Config1:
    def __init__(self):
        self.key = Bytes("Config1")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.prime_asset_id = func.GlobalUint(self.key, 8, 8)
        self.legacy_asset_id = func.GlobalUint(self.key, 16, 8)
        self.parent_application_id = func.GlobalUint(self.key, 24, 8)
        self.theme = func.GlobalUint(self.key, 32, 2)
        self.skin = func.GlobalUint(self.key, 34, 2)
        self.is_founder = func.GlobalUint(self.key, 36, 1)
        self.is_artifact = func.GlobalUint(self.key, 37, 1)
        self.is_pioneer = func.GlobalUint(self.key, 38, 1)
        self.is_explorer = func.GlobalUint(self.key, 39, 1)
        self.score = func.GlobalUint(self.key, 40, 8)
        self.sales = func.GlobalUint(self.key, 48, 4)
        self.mints = func.GlobalUint(self.key, 52, 4)
        self.renames = func.GlobalUint(self.key, 56, 4)
        self.repaints = func.GlobalUint(self.key, 60, 4)
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
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
    platform_asset: abi.Asset,
):
    return Seq(
        func.assert_is_creator(),
        func.assert_is_equal(platform_asset.asset_id(), prime_config.platform_asset_id),
        config1.id.set(id.get()),
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
    description: abi.StaticBytes[Literal[64]],
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
        func.assert_is_creator(),
        config1.score.set(score.get()),
        config1.sales.set(sales.get()),
        config1.mints.set(mints.get()),
        config1.renames.set(renames.get()),
        config1.repaints.set(repaints.get()),
    )


@app.external(name="upgrade")
def upgrade():
    return Seq(
        func.assert_is_zero_int(config1.is_explorer.get()),
        func.assert_sender_asset_transfer(
            config1.legacy_asset_id.get(),
            Global.current_application_address(),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            Txn.sender(),
            Int(1),
        ),
        config1.is_explorer.set(Int(1)),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
):
    return Seq(
        func.assert_is_zero_int(config1.price.get()),
        func.assert_is_zero_address(config1.seller.get()),
        func.assert_is_positive_int(price.get()),
        func.assert_sender_asset_transfer(
            config1.prime_asset_id.get(),
            Global.current_application_address(),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        config1.price.set(price.get()),
        config1.seller.set(Txn.sender()),
    )


@app.external(name="unlist")
def unlist():
    return Seq(
        func.assert_is_positive_int(config1.price.get()),
        func.assert_is_positive_address(config1.seller.get()),
        func.assert_is_equal(config1.seller.get(), Txn.sender()),
        func.execute_asset_transfer(
            config1.prime_asset_id.get(),
            config1.seller.get(),
            Int(1),
        ),
        config1.price.set(Int(0)),
        config1.seller.set(Global.zero_address()),
    )


@app.external(name="buy")
def buy():
    return Seq(
        func.assert_is_positive_int(config1.price.get()),
        func.assert_is_positive_address(config1.seller.get()),
        func.assert_sender_payment(
            config1.seller.get(),
            Div(Mul(config1.price.get(), prime_config.seller_market_share), Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_payment(
            prime_config.admin_address,
            Div(Mul(config1.price.get(), prime_config.admin_market_share), Int(100)),
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
    price = Mul(prime_config.rename_price, value_difference)
    return Seq(
        func.assert_is_max_int(index.get(), Int(7)),
        func.assert_is_min_int(value.get(), Int(65)),
        func.assert_is_max_int(value.get(), Int(90)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.assert_sender_asset_transfer(
            prime_config.platform_asset_id,
            prime_config.platform_asset_reserve,
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
        func.assert_is_max_int(theme.get(), Int(7)),
        func.assert_is_max_int(skin.get(), Int(7)),
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        func.assert_sender_asset_transfer(
            prime_config.platform_asset_id,
            prime_config.platform_asset_reserve,
            prime_config.repaint_price,
            Add(Txn.group_index(), Int(1)),
        ),
        config1.theme.set(theme.get()),
        config1.skin.set(skin.get()),
        config1.repaints.increment(Int(1)),
    )


@app.external(name="mint")
def mint():
    balance = AssetHolding.balance(
        Global.current_application_address(),
        prime_config.platform_asset_id,
    )
    return Seq(
        func.assert_sender_asset_holding(config1.prime_asset_id.get()),
        balance,
        Assert(balance.hasValue()),
        Assert(balance.value() > Int(0)),
        func.execute_asset_transfer(
            prime_config.platform_asset_id,
            Txn.sender(),
            balance.value(),
        ),
        config1.mints.increment(Int(1)),
    )
