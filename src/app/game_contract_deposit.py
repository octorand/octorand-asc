import func
import game_const

from pyteal import *
from typing import *


const = game_const.Config()
statistic = game_const.DepositStatistic()
event = game_const.Event()


@Subroutine(TealType.none)
def create():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
        func.init_global(statistic.key),
    )


@Subroutine(TealType.none)
def update():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )


router = Router(
    name="GameDeposit",
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
def deposit(
    amount: abi.Uint64,
):
    log = Concat(
        event.game_deposit,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Txn.sender(),
        Itob(amount.get()),
    )
    return Seq(
        Log(func.prepare_log(log)),
        Assert(amount.get() > Int(0)),
        func.assert_sender_asset_transfer(
            statistic.platform_asset_id,
            func.get_asset_reserve(statistic.platform_asset_id),
            amount,
            Add(Txn.group_index(), Int(1)),
        ),
        statistic.deposit_count.increment(Int(1)),
        statistic.deposit_amount.increment(amount.get()),
    )
