import func
import gen1_const as const
import gen1_prime_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeMain")

config1 = const.Config1()
config2 = const.Config2()


@Subroutine(TealType.none)
def assert_application_creator(application_id):
    creator = AppParam.creator(application_id)
    return Seq(
        creator,
        Assert(creator.hasValue()),
        Assert(creator.value() == const.manager_address),
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
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
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
    app_id = application.application_id()
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
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
    app_id = application.application_id()
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
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
    app_id = application.application_id()
    return Seq(
        Assert(config1.is_explorer.external(app_id) == Int(0)),
        func.assert_sender_asset_transfer(
            config1.legacy_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
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
    app_id = application.application_id()
    return Seq(
        Assert(config1.seller.external(app_id) == Global.zero_address()),
        Assert(config1.price.external(app_id) == Int(0)),
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            config1.prime_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.list.method_signature(),
            args=[
                price,
                Txn.sender(),
            ],
        ),
    )


@app.external(name="unlist")
def unlist(
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(config1.price.external(app_id) > Int(0)),
        Assert(config1.seller.external(app_id) == Txn.sender()),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.unlist.method_signature(),
            args=[],
        ),
    )


@app.external(name="buy")
def buy(
    application: abi.Application,
):
    app_id = application.application_id()
    seller_share = Mul(config1.price.external(app_id), const.seller_market_share)
    admin_share = Mul(config1.price.external(app_id), const.admin_market_share)
    return Seq(
        Assert(config1.price.external(app_id) > Int(0)),
        Assert(config1.seller.external(app_id) != Global.zero_address()),
        func.assert_sender_payment(
            config1.seller.external(app_id),
            Div(seller_share, Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_payment(
            const.admin_address,
            Div(admin_share, Int(100)),
            Add(Txn.group_index(), Int(2)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.buy.method_signature(),
            args=[
                Txn.sender(),
            ],
        ),
    )


@app.external(name="rename")
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    previous_value = GetByte(config1.name.external(app_id), index.get())
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
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            price,
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.rename.method_signature(),
            args=[
                index,
                value,
            ],
        ),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(theme.get() <= Int(7)),
        Assert(skin.get() <= Int(7)),
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            const.repaint_price,
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.repaint.method_signature(),
            args=[
                theme,
                skin,
            ],
        ),
    )


@app.external(name="describe")
def describe(
    description: abi.StaticBytes[Literal[64]],
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            const.platform_asset_id,
            const.platform_asset_reserve,
            const.describe_price,
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.describe.method_signature(),
            args=[
                description,
            ],
        ),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.mint.method_signature(),
            args=[
                amount,
                Txn.sender(),
            ],
        ),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.withdraw.method_signature(),
            args=[
                amount,
                Txn.sender(),
            ],
        ),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.external(app_id)),
        Assert(asset.asset_id() != config1.legacy_asset_id.external(app_id)),
        func.assert_sender_payment(
            func.get_application_address(app_id),
            const.optin_price,
            Add(Txn.group_index(), Int(1)),
        ),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optin.method_signature(),
            args=[
                asset,
            ],
        ),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    return Seq(
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != config1.prime_asset_id.external(app_id)),
        Assert(asset.asset_id() != config1.legacy_asset_id.external(app_id)),
        func.assert_sender_asset_holding(config1.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optout.method_signature(),
            args=[
                asset,
                Txn.sender(),
            ],
        ),
    )
