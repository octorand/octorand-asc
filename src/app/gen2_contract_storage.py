import func
import gen2_const
import gen2_contract_storage as storage

from pyteal import *
from typing import *


const = gen2_const.Config()
prime = gen2_const.Prime()


@Subroutine(TealType.none)
def create():
    return Seq(
        Assert(Txn.sender() == const.manager_address),
        func.init_global(prime.key_1),
        func.init_global(prime.key_2),
    )


@Subroutine(TealType.none)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


router = Router(
    name="GenOneStorage",
    bare_calls=BareCallActions(
        no_op=OnCompleteAction(
            action=create,
            call_config=CallConfig.CREATE,
        ),
        update_application=OnCompleteAction(
            action=update,
            call_config=CallConfig.CALL,
        ),
    ),
    clear_state=Approve(),
)


@router.method
def initialize(
    id: abi.Uint64,
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
    parent_application: abi.Application,
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        prime.id.set(id.get()),
        prime.prime_asset_id.set(prime_asset.asset_id()),
        prime.legacy_asset_id.set(legacy_asset.asset_id()),
        prime.parent_application_id.set(parent_application.application_id()),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        func.optin_into_asset(const.platform_asset_id),
        func.optin_into_asset(prime_asset.asset_id()),
        func.optin_into_asset(legacy_asset.asset_id()),
    )


@router.method
def populate(
    theme: abi.Uint64,
    skin: abi.Uint64,
    is_founder: abi.Uint64,
    is_artifact: abi.Uint64,
    is_pioneer: abi.Uint64,
    is_explorer: abi.Uint64,
    name: abi.StaticBytes[Literal[16]],
    description: abi.StaticBytes[Literal[64]],
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.is_founder.set(is_founder.get()),
        prime.is_artifact.set(is_artifact.get()),
        prime.is_pioneer.set(is_pioneer.get()),
        prime.is_explorer.set(is_explorer.get()),
        prime.name.set(name.get()),
        prime.description.set(description.get()),
    )


@router.method
def finalize(
    score: abi.Uint64,
    sales: abi.Uint64,
    mints: abi.Uint64,
    renames: abi.Uint64,
    repaints: abi.Uint64,
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        prime.score.set(score.get()),
        prime.sales.set(sales.get()),
        prime.mints.set(mints.get()),
        prime.renames.set(renames.get()),
        prime.repaints.set(repaints.get()),
    )


@router.method
def list(
    price: abi.Uint64,
    seller: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.market_application_id),
        Assert(prime.seller.get() == Global.zero_address()),
        Assert(prime.price.get() == Int(0)),
        prime.price.set(price.get()),
        prime.seller.set(seller.get()),
        Log(log.get()),
    )


@router.method
def unlist(
    seller: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.market_application_id),
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


@router.method
def buy(
    buyer: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.market_application_id),
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


@router.method
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.design_application_id),
        prime.name.set(SetByte(prime.name.get(), index.get(), value.get())),
        prime.renames.increment(Int(1)),
        Log(log.get()),
    )


@router.method
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.design_application_id),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.repaints.increment(Int(1)),
        Log(log.get()),
    )


@router.method
def describe(
    description: abi.StaticBytes[Literal[64]],
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.design_application_id),
        prime.description.set(description.get()),
        Log(log.get()),
    )


@router.method
def upgrade(
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.wallet_application_id),
        Assert(prime.is_explorer.get() == Int(0)),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(),
            owner.get(),
            Int(1),
        ),
        prime.is_explorer.set(Int(1)),
        Log(log.get()),
    )


@router.method
def mint(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.wallet_application_id),
        func.execute_asset_transfer(
            const.platform_asset_id,
            owner.get(),
            amount.get(),
        ),
        prime.mints.increment(Int(1)),
        Log(log.get()),
    )


@router.method
def withdraw(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.wallet_application_id),
        func.execute_payment(
            owner.get(),
            amount.get(),
        ),
        Log(log.get()),
    )


@router.method
def optin(
    asset: abi.Asset,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.vault_application_id),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        func.optin_into_asset(asset.asset_id()),
        Log(log.get()),
    )


@router.method
def optout(
    asset: abi.Asset,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(Global.caller_app_id() == const.vault_application_id),
        Assert(asset.asset_id() != const.platform_asset_id),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        func.optout_from_asset(asset.asset_id(), owner.get()),
        Log(log.get()),
    )


@router.method
def score(
    value: abi.Uint64,
):
    return Seq(
        func.assert_application_creator(Global.caller_app_id(), const.admin_address),
        prime.score.increment(value.get()),
    )
