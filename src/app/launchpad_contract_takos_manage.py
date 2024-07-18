import func
import launchpad_const
import launchpad_contract_takos_app

from pyteal import *
from typing import *


const = launchpad_const.TakosConfig()
prime = launchpad_const.Prime()
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
    name="LaunchpadTakosManage",
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
def buy(
    application: abi.Application,
):
    app_id = application.application_id()
    seller_share = Mul(prime.price.external(app_id), const.seller_market_share)
    admin_share = Mul(prime.price.external(app_id), const.admin_market_share)
    log = Concat(
        event.prime_buy,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        prime.seller.external(app_id),
        Itob(prime.price.external(app_id)),
    )
    return Seq(
        Log(func.prepare_log(log)),
        func.assert_sender_payment(
            prime.seller.external(app_id),
            Div(seller_share, Int(100)),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_sender_payment(
            const.admin_address,
            Div(admin_share, Int(100)),
            Add(Txn.group_index(), Int(2)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen1_contract_prime_app.buy.method_signature(),
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
    seller: abi.Address,
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.prime_buy,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(prime.id.external(app_id)),
        sender.get(),
        seller.get(),
        Itob(price.get()),
    )
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        Log(func.prepare_log(log)),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen1_contract_prime_app.fire.method_signature(),
            args=[
                log,
            ],
        ),
    )
