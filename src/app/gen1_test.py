from pyteal import *


@Subroutine(TealType.none)
def create():
    return Seq(
        Approve(),
    )


@Subroutine(TealType.none)
def update():
    return Seq(
        Approve(),
    )


router = Router(
    name="GenOneTest",
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
def execute(amount: abi.Uint64):
    return Seq(
        Assert(amount.get() > Int(0)),
    )
