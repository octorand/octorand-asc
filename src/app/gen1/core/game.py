import config
import func
import saver

from pyteal import *
from beaker import *

bytes = "bytes"
uint = "uint"

one = "01"
two = "02"

global_master = saver.Global(bytes, one, 0, 32)
global_manager = saver.Global(bytes, one, 32, 32)
global_name = saver.Global(bytes, one, 64, 32)
global_master_share = saver.Global(uint, one, 96, 8)
global_manager_share = saver.Global(uint, one, 104, 8)
global_volume = saver.Global(uint, one, 112, 8)
global_winner_1 = saver.Global(bytes, two, 0, 32)
global_winner_2 = saver.Global(bytes, two, 32, 32)
global_winner_3 = saver.Global(bytes, two, 64, 32)
global_timer = saver.Global(uint, two, 96, 8)
global_status = saver.Global(uint, two, 104, 2)
global_manager_percentage = saver.Global(uint, two, 106, 2)
global_winner_percentage_1 = saver.Global(uint, two, 108, 2)
global_winner_percentage_2 = saver.Global(uint, two, 110, 2)
global_winner_percentage_3 = saver.Global(uint, two, 112, 2)

local_volume = saver.Local(uint, one, 0, 8)


@Subroutine(TealType.none)
def assert_is_master():
    return Seq(
        Assert(Txn.sender() == global_master.get()),
    )


@Subroutine(TealType.none)
def assert_is_manager():
    return Seq(
        Assert(Txn.sender() == global_manager.get()),
    )


@Subroutine(TealType.none)
def assert_is_admin():
    return Seq(
        Assert(
            Or(
                Txn.sender() == global_master.get(),
                Txn.sender() == global_manager.get(),
            )
        ),
    )


@Subroutine(TealType.none)
def assert_is_timer_running():
    return Seq(
        func.assert_is_future(global_timer.get()),
    )


@Subroutine(TealType.none)
def assert_is_timer_elapsed():
    return Seq(
        func.assert_is_past(global_timer.get()),
    )


@Subroutine(TealType.none)
def assert_is_at_status(status):
    return Seq(
        Assert(global_status.get() == status),
    )


@Subroutine(TealType.none)
def send_winner_share(winner, percentage):
    share = Div(Mul(global_volume.get(), percentage), Int(100))
    return Seq(
        If(percentage > Int(0)).Then(
            Assert(local_volume.get(winner) > Int(0)),
            func.execute_payment(winner, share, Int(0)),
        ),
    )


app = Application("LotteryAlgoGame")


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(Bytes(one)),
        func.init_global(Bytes(two)),
    )


@app.opt_in(bare=True)
def opt_in():
    return Seq(
        func.init_local(Txn.sender(), Bytes(one)),
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
        assert_is_master(),
        func.execute_payment(global_master.get(), amount, Int(0)),
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


@app.external(name="play")
def play(amount: abi.Uint64):
    payment_transaction = Gtxn[Add(Txn.group_index(), Int(1))]
    master_percentage = config.master_percentage
    manager_percentage = global_manager_percentage.get()
    master_share = Div(Mul(amount.get(), master_percentage), Int(100))
    manager_share = Div(Mul(amount.get(), manager_percentage), Int(100))
    return Seq(
        assert_is_timer_running(),
        func.assert_is_direct(),
        Assert(amount.get() > Int(0)),
        Assert(payment_transaction.sender() == Txn.sender()),
        Assert(payment_transaction.type_enum() == TxnType.Payment),
        Assert(payment_transaction.receiver() == Global.current_application_address()),
        Assert(payment_transaction.amount() == amount.get()),
        If(Txn.sender() == global_manager.get())
        .Then(
            global_manager_share.increment(master_share),
        )
        .Else(
            global_master_share.increment(master_share),
        ),
        global_manager_share.increment(manager_share),
        global_volume.increment(amount.get()),
        local_volume.increment(Txn.sender(), amount.get()),
    )


@app.external(name="finish")
def finish(winner_1: abi.Account, winner_2: abi.Account, winner_3: abi.Account):
    return Seq(
        assert_is_admin(),
        assert_is_timer_elapsed(),
        assert_is_at_status(Int(0)),
        send_winner_share(winner_1.address(), global_winner_percentage_1.get()),
        send_winner_share(winner_2.address(), global_winner_percentage_2.get()),
        send_winner_share(winner_3.address(), global_winner_percentage_3.get()),
        global_winner_1.set(winner_1.address()),
        global_winner_2.set(winner_2.address()),
        global_winner_3.set(winner_3.address()),
        global_status.set(Int(1)),
    )


@app.external(name="share")
def share(master: abi.Account, manager: abi.Account):
    master_share = global_master_share.get()
    manager_share = global_manager_share.get()
    return Seq(
        assert_is_admin(),
        assert_is_timer_elapsed(),
        assert_is_at_status(Int(1)),
        Assert(master.address() == global_master.get()),
        Assert(manager.address() == global_manager.get()),
        func.execute_payment(global_master.get(), master_share, Int(0)),
        func.execute_payment(global_manager.get(), manager_share, Int(0)),
        global_status.set(Int(2)),
    )


@app.external(name="archive")
def archive():
    return Seq(
        assert_is_master(),
        assert_is_at_status(Int(2)),
        global_status.set(Int(3)),
    )


@app.external(name="update_timer")
def update_timer(timer: abi.Uint64):
    return Seq(
        assert_is_admin(),
        assert_is_timer_running(),
        func.assert_is_future(timer.get()),
        global_timer.set(timer.get()),
    )


@app.external(name="update_name")
def update_name(name: abi.DynamicBytes):
    return Seq(
        assert_is_admin(),
        assert_is_timer_running(),
        func.assert_is_valid_length(name.get(), Int(32)),
        global_name.set(name.get()),
    )


@app.external(name="power")
def power():
    return Seq(
        Approve(),
    )
