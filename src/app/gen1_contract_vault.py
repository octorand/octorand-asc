import func
import gen1_const as const
import gen1_contract_storage as storage

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
    name="GenOneVault",
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
def optin(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.vault_optin,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        Log(log),
        func.assert_sender_payment(
            func.get_application_address(app_id),
            const.optin_price,
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optin.method_signature(),
            args=[
                asset,
                log,
            ],
        ),
    )


@router.method
def optout(
    asset: abi.Asset,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.vault_optout,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        Log(log),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.optout.method_signature(),
            args=[
                asset,
                Txn.sender(),
                log,
            ],
        ),
    )
