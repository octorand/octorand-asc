import func
import launchpad_const
import launchpad_contract_guardians_item_app

from pyteal import *
from typing import *


const = launchpad_const.GuardiansConfig()
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
    name="LaunchpadGuardiansList",
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
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.item_list,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(item.id.external(app_id)),
        Txn.sender(),
        Itob(price.get()),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            item.item_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_guardians_item_app.list.method_signature(),
            args=[
                price,
                Txn.sender(),
                log,
            ],
        ),
    )


@router.method
def move(
    price: abi.Uint64,
    seller: abi.Address,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.item_list,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(item.id.external(app_id)),
        Txn.sender(),
        Itob(price.get()),
    )
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        Log(func.prepare_log(log)),
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            item.item_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_guardians_item_app.list.method_signature(),
            args=[
                price,
                seller,
                log,
            ],
        ),
    )


@router.method
def fire(
    timestamp: abi.Uint64,
    sender: abi.Address,
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.item_list,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(item.id.external(app_id)),
        sender.get(),
        Itob(price.get()),
    )
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        Log(func.prepare_log(log)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_guardians_item_app.fire.method_signature(),
            args=[
                log,
            ],
        ),
    )
