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
    name="GenOneMarket",
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
        event.market_list,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(price.get()),
    )
    return Seq(
        Assert(price.get() > Int(0)),
        func.assert_sender_asset_transfer(
            prime.prime_asset_id.external(app_id),
            func.get_application_address(app_id),
            Int(1),
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.list.method_signature(),
            args=[
                price,
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@router.method
def unlist(
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.market_unlist,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
    )
    return Seq(
        func.assert_application_creator(app_id, const.manager_address),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=storage.unlist.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )


@router.method
def buy(
    application: abi.Application,
):
    app_id = application.application_id()
    seller_share = Mul(prime.price.external(app_id), const.seller_market_share)
    admin_share = Mul(prime.price.external(app_id), const.admin_market_share)
    log = Concat(
        event.market_buy,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        prime.seller.external(app_id),
        Itob(prime.price.external(app_id)),
    )
    return Seq(
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
            method_signature=storage.buy.method_signature(),
            args=[
                Txn.sender(),
                log,
            ],
        ),
        Log(log),
    )
