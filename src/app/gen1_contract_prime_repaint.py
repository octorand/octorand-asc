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
    name="GenOnePrimeRepaint",
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
def repaint(
    theme: abi.Uint64,
    skin: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    score_value = const.repaint_score
    score = abi.make(abi.Uint64)
    transforms_value = Int(1)
    transforms = abi.make(abi.Uint64)
    log = Concat(
        event.prime_repaint,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(theme.get()),
        Itob(skin.get()),
        Itob(const.repaint_price),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(theme.get() <= Int(15)),
        Assert(skin.get() <= Int(15)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            prime.platform_asset_id.external(app_id),
            func.get_asset_reserve(prime.platform_asset_id.external(app_id)),
            const.repaint_price,
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        score.set(score_value),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen1_contract_prime_app.score.method_signature(),
            args=[
                score,
            ],
        ),
        transforms.set(transforms_value),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen1_contract_prime_app.repaint.method_signature(),
            args=[
                theme,
                skin,
                transforms,
                log,
            ],
        ),
    )


@router.method
def fire(
    timestamp: abi.Uint64,
    sender: abi.Address,
    theme: abi.Uint64,
    skin: abi.Uint64,
    price: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    log = Concat(
        event.prime_repaint,
        Itob(Int(0)),
        Itob(timestamp.get()),
        Itob(prime.id.external(app_id)),
        sender.get(),
        Itob(theme.get()),
        Itob(skin.get()),
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
