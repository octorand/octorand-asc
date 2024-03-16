import config
import func
import game

from pyteal import *
from beaker import *


@Subroutine(TealType.bytes)
def game_approval_program():
    return Seq(
        precompiled(game.app).approval_program.binary,
    )


@Subroutine(TealType.bytes)
def game_clear_program():
    return Seq(
        precompiled(game.app).clear_program.binary,
    )


@Subroutine(TealType.none)
def assert_is_payment_made():
    payment_transaction = Gtxn[Add(Txn.group_index(), Int(1))]
    return Seq(
        Assert(payment_transaction.sender() == Txn.sender()),
        Assert(payment_transaction.type_enum() == TxnType.Payment),
        Assert(payment_transaction.receiver() == Global.current_application_address()),
        Assert(payment_transaction.amount() == config.creation_cost),
    )


@Subroutine(TealType.none)
def assert_is_valid_percentages(manager_percentage, winner_percentage):
    total_percentage = Add(
        config.master_percentage,
        manager_percentage,
        winner_percentage,
    )
    return Seq(
        Assert(total_percentage == Int(100)),
    )


app = Application("PredictionAlgoMain")


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="clean")
def clean():
    amount = Minus(
        Balance(Global.current_application_address()),
        MinBalance(Global.current_application_address()),
    )
    return Seq(
        func.assert_is_creator(),
        func.execute_payment(Global.creator_address(), amount, Int(0)),
    )


@app.external(name="update_game")
def update_game(application: abi.Application):
    return Seq(
        func.assert_is_creator(),
        func.update_application(
            application.application_id(),
            game_approval_program(),
            game_clear_program(),
            Int(0),
        ),
    )


@app.external(name="create_game")
def create_game(
    timer: abi.Uint64,
    manager_percentage: abi.Uint64,
    winner_percentage: abi.Uint64,
    name: abi.DynamicBytes,
    option_1: abi.DynamicBytes,
    option_2: abi.DynamicBytes,
    option_3: abi.DynamicBytes,
):
    created_game_app_id = ScratchVar(TealType.uint64)
    created_game_app_address = AppParam.address(created_game_app_id.load())
    return Seq(
        assert_is_payment_made(),
        assert_is_valid_percentages(
            manager_percentage.get(),
            winner_percentage.get(),
        ),
        func.assert_is_future(timer.get()),
        func.assert_is_valid_length(name.get(), Int(32)),
        func.assert_is_valid_length(option_1.get(), Int(24)),
        func.assert_is_valid_length(option_2.get(), Int(24)),
        func.assert_is_valid_length(option_3.get(), Int(24)),
        func.create_application(
            game_approval_program(),
            game_clear_program(),
            Int(0),
            Int(2),
            Int(0),
            Int(1),
            Int(0),
            Global.min_txn_fee(),
        ),
        created_game_app_id.store(InnerTxn.created_application_id()),
        created_game_app_address,
        func.execute_payment(
            created_game_app_address.value(), Int(100000), Global.min_txn_fee()
        ),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=created_game_app_id.load(),
            method_signature=game.init.method_signature(),
            args=[
                Global.creator_address(),
                Txn.sender(),
                timer,
                manager_percentage,
                winner_percentage,
                name,
                option_1,
                option_2,
                option_3,
            ],
        ),
    )
