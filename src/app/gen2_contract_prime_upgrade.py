import func
import gen2_const
import gen2_contract_prime_app

from pyteal import *
from typing import *


const = gen2_const.Config()
prime = gen2_const.Prime()
event = gen2_const.Event()


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
    name="GenTwoPrimeUpgrade",
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
        event.prime_upgrade,
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
            method_signature=gen2_contract_prime_app.upgrade.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
    )


@router.method
def fire(
    timestamp: abi.Uint64,
    sender: abi.Address,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.prime_upgrade,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(prime.id.external(app_id)),
        sender.get(),
    )
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        Log(func.prepare_log(log)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen2_contract_prime_app.fire.method_signature(),
            args=[
                log,
            ],
        ),
    )
