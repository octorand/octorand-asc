import func
import gen2_const as const
import gen2_contract_storage as storage

from pyteal import *
from typing import *


prime = const.Prime()
event = const.Event()


@Subroutine(TealType.none)
def create():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


@Subroutine(TealType.none)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


router = Router(
    name="GenOneWallet",
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
def upgrade(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.wallet_upgrade,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        Log(func.prepare_log(log)),
        func.assert_sender_asset_transfer(
            prime.legacy_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.upgrade.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
    )


@router.method
def mint(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.wallet_mint,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.mint.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
    )


@router.method
def withdraw(
    amount: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.wallet_withdraw,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.withdraw.method_signature(),
            args=[
                amount,
                Txn.sender(),
                log,
            ],
        ),
    )
