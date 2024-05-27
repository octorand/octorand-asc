from pyteal import *


router = Router(
    name="GenOneTest",
    bare_calls=BareCallActions(
        no_op=OnCompleteAction(action=Approve(), call_config=CallConfig.CREATE),
        update_application=OnCompleteAction(
            action=Approve(), call_config=CallConfig.CALL
        ),
        delete_application=OnCompleteAction(
            action=Approve(), call_config=CallConfig.CALL
        ),
    ),
    clear_state=Approve(),
)


@router.method
def execute(amount: abi.Uint64):
    return Seq(
        Assert(amount.get() > Int(0)),
    )
