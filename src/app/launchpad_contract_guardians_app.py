import func
import launchpad_const

from pyteal import *
from typing import *


const = launchpad_const.GuardiansConfig()
item = launchpad_const.Item()


@Subroutine(TealType.none)
def assert_caller():
    return Seq(
        func.assert_application_creator(Global.caller_app_id(), const.admin_address),
    )


@Subroutine(TealType.none)
def refresh_balance():
    rewards = AssetHolding.balance(
        Global.current_application_address(),
        item.platform_asset_id.get(),
    )
    return Seq(
        rewards,
        item.rewards.set(rewards.value()),
    )


@Subroutine(TealType.none)
def create():
    return Seq(
        Assert(Txn.sender() == const.manager_address),
        func.init_global(item.key),
    )


@Subroutine(TealType.none)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


router = Router(
    name="LaunchpadGuardians",
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
    platform_asset: abi.Asset,
    item_asset: abi.Asset,
    name: abi.StaticBytes[Literal[16]],
    owner: abi.Address,
):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        item.id.set(id.get()),
        item.platform_asset_id.set(platform_asset.asset_id()),
        item.item_asset_id.set(item_asset.asset_id()),
        item.name.set(name.get()),
        item.owner.set(owner.get()),
        item.price.set(Int(0)),
        item.seller.set(Global.zero_address()),
        func.optin_into_asset(platform_asset.asset_id()),
        func.optin_into_asset(item_asset.asset_id()),
    )


@router.method
def list(
    price: abi.Uint64,
    seller: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(item.seller.get() == Global.zero_address()),
        Assert(item.price.get() == Int(0)),
        assert_caller(),
        item.price.set(price.get()),
        item.seller.set(seller.get()),
        Log(log.get()),
    )


@router.method
def unlist(
    seller: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(item.price.get() > Int(0)),
        Assert(item.seller.get() == seller.get()),
        assert_caller(),
        func.execute_asset_transfer(
            item.item_asset_id.get(),
            seller.get(),
            Int(1),
        ),
        item.price.set(Int(0)),
        item.seller.set(Global.zero_address()),
        Log(log.get()),
    )


@router.method
def buy(
    buyer: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(item.price.get() > Int(0)),
        Assert(item.seller.get() != Global.zero_address()),
        assert_caller(),
        func.execute_asset_transfer(
            item.item_asset_id.get(),
            buyer.get(),
            Int(1),
        ),
        item.price.set(Int(0)),
        item.seller.set(Global.zero_address()),
        item.owner.set(buyer.get()),
        Log(log.get()),
    )


@router.method
def rename(
    name: abi.StaticBytes[Literal[16]],
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        item.name.set(name.get()),
        Log(log.get()),
    )


@router.method
def mint(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        func.execute_asset_transfer(
            item.platform_asset_id.get(),
            owner.get(),
            amount.get(),
        ),
        refresh_balance(),
        Log(log.get()),
    )


@router.method
def claim(
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        item.owner.set(owner.get()),
        Log(log.get()),
    )


@router.method
def fire(
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        Log(log.get()),
    )


@router.method
def refresh():
    return Seq(
        refresh_balance(),
    )
