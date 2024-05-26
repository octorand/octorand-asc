import func
import gen1_const as const
import gen1_prime_storage as storage

from pyteal import *
from beaker import *
from typing import *


app = Application("GenOnePrimeMain")

prime = const.Prime()


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
    log = Concat(
        MethodSignature(
            "initialize(uint64,uint64,uint64,address,uint64,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(id.get()),
        Txn.sender(),
        Itob(prime_asset.asset_id()),
        Itob(legacy_asset.asset_id()),
    )
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
                log,
            ],
        ),
        Log(log),
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
    log = Concat(
        MethodSignature(
            "populate(uint64,uint64,uint64,address,uint64,uint64,uint64,uint64,uint64,uint64,byte[8],byte[64])",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(theme.get()),
        Itob(skin.get()),
        Itob(is_founder.get()),
        Itob(is_artifact.get()),
        Itob(is_pioneer.get()),
        Itob(is_explorer.get()),
        name.get(),
        description.get(),
    )
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
                log,
            ],
        ),
        Log(log),
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
    log = Concat(
        MethodSignature(
            "finalize(uint64,uint64,uint64,address,uint64,uint64,uint64,uint64,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(score.get()),
        Itob(sales.get()),
        Itob(mints.get()),
        Itob(renames.get()),
        Itob(repaints.get()),
    )
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="upgrade")
def upgrade(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "upgrade(uint64,uint64,uint64,address)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        func.assert_sender_asset_transfer(
            prime.legacy_asset_id.external(app_id),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="list")
def list(
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "list(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(price.get()),
    )
    return Seq(
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            prime.prime_asset_id.external(app_id),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="unlist")
def unlist(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "unlist(uint64,uint64,uint64,address)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.unlist.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="buy")
def buy(
    application: abi.Application,
):
    app_id = application.application_id()
    seller_share = Mul(prime.price.external(app_id), const.seller_market_share)
    admin_share = Mul(prime.price.external(app_id), const.admin_market_share)
    log = Concat(
        MethodSignature(
            "buy(uint64,uint64,uint64,address,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        prime.seller.external(app_id),
        Itob(prime.price.external(app_id)),
    )
    return Seq(
        func.assert_sender_payment(
            prime.seller.external(app_id),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="rename")
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    previous_value = GetByte(prime.name.external(app_id), index.get())
    next_value = value.get()
    value_difference = If(
        Gt(next_value, previous_value),
        Minus(next_value, previous_value),
        Minus(previous_value, next_value),
    )
    price = Mul(const.rename_price, value_difference)
    log = Concat(
        MethodSignature(
            "rename(uint64,uint64,uint64,address,uint64,uint64,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(index.get()),
        Itob(value.get()),
        Itob(price),
    )
    return Seq(
        Assert(index.get() <= Int(7)),
        Assert(value.get() >= Int(65)),
        Assert(value.get() <= Int(90)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="repaint")
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "repaint(uint64,uint64,uint64,address,uint64,uint64,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(theme.get()),
        Itob(skin.get()),
        Itob(const.repaint_price),
    )
    return Seq(
        Assert(theme.get() <= Int(7)),
        Assert(skin.get() <= Int(7)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="describe")
def describe(
    description: abi.StaticBytes[Literal[64]],
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "describe(uint64,uint64,uint64,address,byte[64],uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        description.get(),
        Itob(const.describe_price),
    )
    return Seq(
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="mint")
def mint(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "mint(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.mint.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="withdraw")
def withdraw(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "withdraw(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.withdraw.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="optin")
def optin(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "optin(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
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
                log,
            ],
        ),
        Log(log),
    )


@app.external(name="optout")
def optout(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        MethodSignature(
            "optout(uint64,uint64,uint64,address,uint64)",
        ),
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        assert_application_creator(app_id),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optout.method_signature(),
            args=[
                asset,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )
