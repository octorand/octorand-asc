import func
import gen1_const

from pyteal import *
from typing import *


const = gen1_const.Config()


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
    name="GenOnePrime",
    bare_calls=BareCallActions(
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
def initialize():
    return Seq(
        Assert(Txn.sender() == const.admin_address),
    )
