import func
import gen1_const

from pyteal import *
from typing import *


const = gen1_const.Config()
prime = gen1_const.Prime()


@Subroutine(TealType.none)
def assert_caller():
    return Seq(
        func.assert_application_creator(Global.caller_app_id(), const.admin_address),
    )


@Subroutine(TealType.none)
def refresh_balance():
    rewards = AssetHolding.balance(
        Global.current_application_address(),
        prime.platform_asset_id.get(),
    )
    royalties = Minus(
        Balance(Global.current_application_address()),
        MinBalance(Global.current_application_address()),
    )
    return Seq(
        rewards,
        prime.rewards.set(rewards.value()),
        prime.royalties.set(royalties),
    )


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
    ),
    clear_state=Approve(),
)


@router.method
def list(
    price: abi.Uint64,
    seller: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(prime.seller.get() == Global.zero_address()),
        Assert(prime.price.get() == Int(0)),
        assert_caller(),
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
        Assert(prime.price.get() > Int(0)),
        Assert(prime.seller.get() == seller.get()),
        assert_caller(),
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
        Assert(prime.price.get() > Int(0)),
        Assert(prime.seller.get() != Global.zero_address()),
        assert_caller(),
        func.execute_asset_transfer(
            prime.prime_asset_id.get(),
            buyer.get(),
            Int(1),
        ),
        prime.price.set(Int(0)),
        prime.seller.set(Global.zero_address()),
        prime.owner.set(buyer.get()),
        prime.sales.increment(Int(1)),
        Log(log.get()),
    )


@router.method
def rename(
    index: abi.Uint64,
    value: abi.Uint64,
    transforms: abi.Uint64,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        prime.name.set(SetByte(prime.name.get(), index.get(), value.get())),
        prime.transforms.increment(transforms.get()),
        Log(log.get()),
    )


@router.method
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    transforms: abi.Uint64,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        prime.theme.set(theme.get()),
        prime.skin.set(skin.get()),
        prime.transforms.increment(transforms.get()),
        Log(log.get()),
    )


@router.method
def upgrade(
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(prime.is_explorer.get() == Int(0)),
        assert_caller(),
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
        assert_caller(),
        func.execute_asset_transfer(
            prime.platform_asset_id.get(),
            owner.get(),
            amount.get(),
        ),
        prime.drains.increment(Int(1)),
        refresh_balance(),
        Log(log.get()),
    )


@router.method
def withdraw(
    amount: abi.Uint64,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        func.execute_payment(
            owner.get(),
            amount.get(),
        ),
        refresh_balance(),
        Log(log.get()),
    )


@router.method
def optin(
    asset: abi.Asset,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(asset.asset_id() != prime.platform_asset_id.get()),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        assert_caller(),
        func.optin_into_asset(asset.asset_id()),
        prime.vaults.increment(Int(1)),
        refresh_balance(),
        Log(log.get()),
    )


@router.method
def optout(
    asset: abi.Asset,
    owner: abi.Address,
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        Assert(asset.asset_id() != prime.platform_asset_id.get()),
        Assert(asset.asset_id() != prime.prime_asset_id.get()),
        Assert(asset.asset_id() != prime.legacy_asset_id.get()),
        assert_caller(),
        func.optout_from_asset(asset.asset_id(), owner.get()),
        prime.vaults.decrement(Int(1)),
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
        prime.owner.set(owner.get()),
        Log(log.get()),
    )


@router.method
def event(
    log: abi.StaticBytes[Literal[240]],
):
    return Seq(
        assert_caller(),
        Log(log.get()),
    )


@router.method
def score(
    value: abi.Uint64,
):
    return Seq(
        assert_caller(),
        prime.score.increment(value.get()),
    )


@router.method
def refresh():
    return Seq(
        refresh_balance(),
    )
