import launchpad_const

from pyteal import *
from typing import *


const = launchpad_const.TakosConfig()


@Subroutine(TealType.none)
def create():
    return Seq(
        Assert(Txn.sender() == const.manager_address),
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
    name="LaunchpadTakos",
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
def optin(asset: abi.Asset):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset.asset_id(),
                TxnField.asset_amount: Int(0),
                TxnField.asset_receiver: Global.current_application_address(),
                TxnField.fee: Int(0),
            }
        ),
    )


@router.method
def optout(asset: abi.Asset):
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: asset.asset_id(),
                TxnField.asset_amount: Int(0),
                TxnField.asset_receiver: Txn.sender(),
                TxnField.asset_close_to: Txn.sender(),
                TxnField.fee: Int(0),
            }
        ),
    )


@router.method
def withdraw():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.amount: Int(0),
                TxnField.receiver: Txn.sender(),
                TxnField.close_remainder_to: Txn.sender(),
                TxnField.fee: Int(0),
            }
        ),
    )
