import func
import game_const

from pyteal import *
from typing import *


const = game_const.Config()
statistic = game_const.AuthStatistic()
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
    name="GameAuth",
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
def auth(
    key: abi.StaticBytes[Literal[48]],
):
    log = Concat(
        event.game_auth,
        Itob(Int(1)),
        Itob(Global.latest_timestamp()),
        Txn.sender(),
        key.get(),
    )
    return Seq(
        Log(func.prepare_log(log)),
        statistic.auth_count.increment(Int(1)),
    )
