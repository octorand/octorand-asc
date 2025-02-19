import func
import gen2_const

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


@Subroutine(TealType.none)
def delete():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


router = Router(
    name="GenOnePrime",
    bare_calls=BareCallActions(
        no_op=OnCompleteAction(
            action=create,
            call_config=CallConfig.CREATE,
        ),
        update_application=OnCompleteAction(
            action=update,
            call_config=CallConfig.CALL,
        ),
        delete_application=OnCompleteAction(
            action=delete,
            call_config=CallConfig.CALL,
        ),
    ),
    clear_state=Approve(),
)


@router.method
def initialize(
    id: abi.Uint64,
    platform_asset: abi.Asset,
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
    parent_application: abi.Application,
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        prime.id.set(id.get()),
        prime.platform_asset_id.set(platform_asset.asset_id()),
        prime.prime_asset_id.set(prime_asset.asset_id()),
        prime.legacy_asset_id.set(legacy_asset.asset_id()),
        prime.parent_application_id.set(parent_application.application_id()),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        func.optin_into_asset(platform_asset.asset_id()),
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
    score: abi.Uint64,
    sales: abi.Uint64,
    drains: abi.Uint64,
    transforms: abi.Uint64,
    name: abi.StaticBytes[Literal[16]],
    owner: abi.Address,
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.is_founder.set(is_founder.get()),
        prime.is_artifact.set(is_artifact.get()),
        prime.is_pioneer.set(is_pioneer.get()),
        prime.is_explorer.set(is_explorer.get()),
        prime.score.set(score.get()),
        prime.sales.set(sales.get()),
        prime.drains.set(drains.get()),
        prime.transforms.set(transforms.get()),
        prime.name.set(name.get()),
        prime.owner.set(owner.get()),
    )
