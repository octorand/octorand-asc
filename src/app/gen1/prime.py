import config
import func
import saver

from pyteal import *
from beaker import *

bytes = "bytes"
uint = "uint"

one = "01"
two = "02"

global_id = saver.Global(uint, one, 0, 8)
global_application_id = saver.Global(uint, one, 8, 8)
global_asset_id = saver.Global(uint, one, 16, 8)
global_legacy_id = saver.Global(uint, one, 24, 8)
global_score = saver.Global(uint, one, 32, 8)
global_likes = saver.Global(uint, one, 40, 8)
global_theme = saver.Global(uint, one, 48, 8)
global_skin = saver.Global(uint, one, 56, 8)
global_royalties = saver.Global(uint, one, 64, 8)
global_rewards = saver.Global(uint, one, 72, 8)
global_transforms = saver.Global(uint, one, 80, 8)
global_sales = saver.Global(uint, one, 88, 8)
global_mints = saver.Global(uint, one, 96, 8)
global_price = saver.Global(uint, one, 104, 8)
global_is_artifact = saver.Global(uint, one, 112, 2)
global_is_pioneer = saver.Global(uint, one, 114, 2)
global_is_founder = saver.Global(uint, one, 116, 2)
global_is_winner = saver.Global(uint, one, 118, 2)
global_description = saver.Global(bytes, two, 0, 32)
global_owner = saver.Global(bytes, two, 32, 32)
global_name = saver.Global(bytes, two, 64, 8)
global_parent_id = saver.Global(uint, two, 72, 8)


app = Application("GenOnePrime")


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(Bytes(one)),
        func.init_global(Bytes(two)),
    )


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


@app.external(name="init")
def init(
    master: abi.Address,
    manager: abi.Address,
    timer: abi.Uint64,
    manager_percentage: abi.Uint64,
    winner_percentage_1: abi.Uint64,
    winner_percentage_2: abi.Uint64,
    winner_percentage_3: abi.Uint64,
    name: abi.DynamicBytes,
):
    return Seq(
        func.assert_is_creator(),
        global_master.set(master.get()),
        global_manager.set(manager.get()),
        global_timer.set(timer.get()),
        global_manager_percentage.set(manager_percentage.get()),
        global_winner_percentage_1.set(winner_percentage_1.get()),
        global_winner_percentage_2.set(winner_percentage_2.get()),
        global_winner_percentage_3.set(winner_percentage_3.get()),
        global_name.set(name.get()),
    )
