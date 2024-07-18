import func
import launchpad_const
import launchpad_contract_takos_app

from pyteal import *
from typing import *


const = launchpad_const.TakosConfig()
item = launchpad_const.Item()
event = launchpad_const.Event()


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
    name="LaunchpadTakosUnlist",
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
def unlist(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.item_unlist,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(item.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        Log(func.prepare_log(log)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_takos_app.unlist.method_signature(),
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
        event.item_unlist,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(item.id.external(app_id)),
        sender.get(),
    )
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        Log(func.prepare_log(log)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_takos_app.fire.method_signature(),
            args=[
                log,
            ],
        ),
    )
