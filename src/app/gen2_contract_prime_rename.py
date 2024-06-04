import func
import gen2_const
import gen2_contract_prime_app
import gen1_contract_prime_app

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
    name="GenTwoPrimeRename",
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
    index: abi.Uint64,
    value: abi.Uint64,
    application: abi.Application,
):
    app_id = application.application_id()
    previous_value = GetByte(prime.name.external(app_id), index.get())
    next_value = value.get()
    value_difference = If(
        Gt(next_value, previous_value),
        Minus(next_value, previous_value),
        Minus(previous_value, next_value),
    )
    price = Mul(const.rename_price, value_difference)
    score_value = Mul(const.rename_score, value_difference)
    score = abi.make(abi.Uint64)
    parent_score_value = Div(score_value, const.parent_score_share)
    parent_score = abi.make(abi.Uint64)
    transforms_value = value_difference
    transforms = abi.make(abi.Uint64)
    log = Concat(
        event.prime_rename,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Itob(prime.id.external(app_id)),
        Txn.sender(),
        Itob(index.get()),
        Itob(value.get()),
        Itob(price),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(index.get() <= Int(15)),
        Assert(value.get() >= Int(65)),
        Assert(value.get() <= Int(90)),
        func.assert_sender_asset_holding(prime.prime_asset_id.external(app_id)),
        func.assert_sender_asset_transfer(
            prime.platform_asset_id.external(app_id),
            func.get_asset_reserve(prime.platform_asset_id.external(app_id)),
            price,
            Add(Txn.group_index(), Int(1)),
        ),
        func.assert_application_creator(app_id, const.manager_address),
        score.set(score_value),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen2_contract_prime_app.score.method_signature(),
            args=[
                score,
            ],
        ),
        parent_score.set(parent_score),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=prime.parent_application_id.external(app_id),
            method_signature=gen1_contract_prime_app.score.method_signature(),
            args=[
                parent_score,
            ],
        ),
        transforms.set(transforms_value),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=app_id,
            method_signature=gen2_contract_prime_app.rename.method_signature(),
            args=[
                index,
                value,
                transforms,
                log,
            ],
        ),
    )
