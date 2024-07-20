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
    name="LaunchpadGuardiansRename",
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
def rename(
    name: abi.StaticBytes[Literal[16]],
    application: abi.Application,
):
    app_id = application.application_id()
    burner_share = Mul(const.rename_price, const.rename_burner_share)
    treasury_share = Mul(const.rename_price, const.rename_treasury_share)
    admin_share = Mul(const.rename_price, const.rename_admin_share)
    log = Concat(
        event.item_rename,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(item.id.external(app_id)),
        Txn.sender(),
        name.get(),
        Itob(const.rename_price),
    )
    return Seq(
        Log(func.prepare_log(log)),
        func.assert_sender_asset_holding(item.item_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            item.platform_asset_id.external(app_id),
            const.burner_address,
            Div(burner_share, Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_asset_transfer(
            item.platform_asset_id.external(app_id),
            const.treasury_address,
            Div(treasury_share, Int(100)),
            Add(Txn.group_index(), Int(2)),
        ),
        func.assert_sender_asset_transfer(
            item.platform_asset_id.external(app_id),
            const.admin_address,
            Div(admin_share, Int(100)),
            Add(Txn.group_index(), Int(3)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=launchpad_contract_guardians_item_app.rename.method_signature(),
            args=[
                name,
                log,
            ],
        ),
    )


@router.method
def fire(
    timestamp: abi.Uint64,
    sender: abi.Address,
    name: abi.StaticBytes[Literal[16]],
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.item_rename,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(item.id.external(app_id)),
        sender.get(),
        name.get(),
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
