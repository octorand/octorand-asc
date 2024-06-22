import func
import gen1_const
import gen1_contract_prime_app

from pyteal import *
from typing import *


const = gen1_const.Config()
prime = gen1_const.Prime()
event = gen1_const.Event()


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
    name="GenOnePrimeOptin",
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
        event.prime_optin,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(asset.asset_id()),
    )
    return Seq(
        Log(func.prepare_log(log)),
        func.assert_sender_payment(
            func.get_application_address(app_id),
            const.optin_price,
            Minus(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen1_contract_prime_app.optin.method_signature(),
            args=[
                asset,
                log,
            ],
        ),
    )
