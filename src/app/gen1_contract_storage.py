import func
import gen1_const as const

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeStorage")

prime = const.Prime()


@Subroutine(TealType.none)
def assert_application_caller():
    return Seq(
        Assert(Global.caller_app_id() == const.main_application_id),
    )


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(prime.key_1),
        func.init_global(prime.key_2),
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
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.id.set(id.get()),
        prime.prime_asset_id.set(prime_asset.asset_id()),
        prime.legacy_asset_id.set(legacy_asset.asset_id()),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        func.optin_into_asset(const.platform_asset_id),
        func.optin_into_asset(prime_asset.asset_id()),
        func.optin_into_asset(legacy_asset.asset_id()),
        Log(log.get()),
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
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.is_founder.set(is_founder.get()),
        prime.is_artifact.set(is_artifact.get()),
        prime.is_pioneer.set(is_pioneer.get()),
        prime.is_explorer.set(is_explorer.get()),
        prime.name.set(name.get()),
        prime.description.set(description.get()),
        Log(log.get()),
    )


@app.external(name="finalize")
def finalize(
    score: abi.Uint64,
    sales: abi.Uint64,
    mints: abi.Uint64,
    renames: abi.Uint64,
    repaints: abi.Uint64,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.score.set(score.get()),
        prime.sales.set(sales.get()),
        prime.mints.set(mints.get()),
        prime.renames.set(renames.get()),
        prime.repaints.set(repaints.get()),
        Log(log.get()),
    )


@app.external(name="upgrade")
def upgrade(
    owner: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(prime.is_explorer.get() == Int(0)),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(),
            owner.get(),
            Int(1),
        ),
        prime.is_explorer.set(Int(1)),
        Log(log.get()),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    seller: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(prime.seller.get() == Global.zero_address()),
        Assert(prime.price.get() == Int(0)),
        prime.price.set(price.get()),
        prime.seller.set(seller.get()),
        Log(log.get()),
    )


@app.external(name="unlist")
def unlist(
    seller: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(prime.price.get() > Int(0)),
        Assert(prime.seller.get() == seller.get()),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(),
            seller.get(),
            Int(1),
        ),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        Log(log.get()),
    )


@app.external(name="buy")
def buy(
    buyer: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(prime.price.get() > Int(0)),
        Assert(prime.seller.get() != Global.zero_address()),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(),
            buyer.get(),
            Int(1),
        ),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        prime.sales.increment(Int(1)),
        Log(log.get()),
    )


@app.external(name="rename")
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.name.set(SetByte(prime.name.get(), index.get(), value.get())),
        prime.renames.increment(Int(1)),
        Log(log.get()),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.repaints.increment(Int(1)),
        Log(log.get()),
    )


@app.external(name="describe")
def describe(
    description: abi.StaticBytes[Literal[64]],
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        prime.description.set(description.get()),
        Log(log.get()),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        func.execute_asset_transfer(
            const.platform_asset_id,
            owner.get(),
            amount.get(),
        ),
        prime.mints.increment(Int(1)),
        Log(log.get()),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        func.execute_payment(
            owner.get(),
            amount.get(),
        ),
        Log(log.get()),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        func.optin_into_asset(asset.asset_id()),
        Log(log.get()),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
    owner: abi.Address,
    log: abi.DynamicBytes,
):
    return Seq(
        assert_application_caller(),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        func.optout_from_asset(asset.asset_id(), owner.get()),
        Log(log.get()),
    )
