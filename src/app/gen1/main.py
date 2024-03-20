import config
import func
import saver
import prime

from pyteal import *
from beaker import *

box_id = saver.BoxUint(0, 8)
box_application_id = saver.BoxUint(8, 8)
box_asset_id = saver.BoxUint(16, 8)
box_legacy_id = saver.BoxUint(24, 8)
box_score = saver.BoxUint(32, 8)
box_likes = saver.BoxUint(40, 8)
box_theme = saver.BoxUint(48, 8)
box_skin = saver.BoxUint(56, 8)
box_royalties = saver.BoxUint(64, 8)
box_rewards = saver.BoxUint(72, 8)
box_transforms = saver.BoxUint(80, 8)
box_sales = saver.BoxUint(88, 8)
box_mints = saver.BoxUint(96, 8)
box_price = saver.BoxUint(104, 8)
box_is_artifact = saver.BoxUint(112, 2)
box_is_pioneer = saver.BoxUint(114, 2)
box_is_founder = saver.BoxUint(116, 2)
box_is_winner = saver.BoxUint(118, 2)
box_description = saver.BoxBytes(0, 32)
box_owner = saver.BoxBytes(32, 32)
box_name = saver.BoxBytes(64, 8)
box_parent_id = saver.BoxUint(72, 8)


@Subroutine(TealType.bytes)
def prime_approval_program():
    return Seq(
        precompiled(prime.app).approval_program.binary,
    )


@Subroutine(TealType.bytes)
def prime_clear_program():
    return Seq(
        precompiled(prime.app).clear_program.binary,
    )


app = Application("GenOneMain")


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


@app.external(name="update_prime")
def update_prime(application: abi.Application):
    return Seq(
        func.assert_is_creator(),
        func.update_application(
            application.application_id(),
            game_approval_program(),
            game_clear_program(),
            Int(0),
        ),
    )


@app.external(name="create_prime")
def create_prime(
    timer: abi.Uint64,
    manager_percentage: abi.Uint64,
    winner_percentage_1: abi.Uint64,
    winner_percentage_2: abi.Uint64,
    winner_percentage_3: abi.Uint64,
    name: abi.DynamicBytes,
):
    created_game_app_id = ScratchVar(TealType.uint64)
    created_game_app_address = AppParam.address(created_game_app_id.load())
    return Seq(
        assert_is_payment_made(),
        assert_is_valid_percentages(
            manager_percentage.get(),
            winner_percentage_1.get(),
            winner_percentage_2.get(),
            winner_percentage_3.get(),
        ),
        func.assert_is_future(timer.get()),
        func.assert_is_valid_length(name.get(), Int(32)),
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
                winner_percentage_1,
                winner_percentage_2,
                winner_percentage_3,
                name,
            ],
        ),
    )
