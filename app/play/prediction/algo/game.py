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
global_option_1 = saver.Global(bytes, two, 0, 24)
global_option_2 = saver.Global(bytes, two, 24, 24)
global_option_3 = saver.Global(bytes, two, 48, 24)
global_tickets_1 = saver.Global(uint, two, 72, 8)
global_tickets_2 = saver.Global(uint, two, 80, 8)
global_tickets_3 = saver.Global(uint, two, 88, 8)
global_timer = saver.Global(uint, two, 96, 8)
global_status = saver.Global(uint, two, 104, 2)
global_manager_percentage = saver.Global(uint, two, 106, 2)
global_winner_percentage = saver.Global(uint, two, 108, 2)
global_winner = saver.Global(uint, two, 110, 2)

local_tickets_1 = saver.Local(uint, one, 0, 8)
local_tickets_2 = saver.Local(uint, one, 8, 8)
local_tickets_3 = saver.Local(uint, one, 16, 8)
local_volume = saver.Local(uint, one, 24, 8)
local_withdrawn = saver.Local(uint, one, 32, 8)


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
def assert_is_valid_option(option):
    return Seq(
        Assert(option > Int(0)),
        Assert(option <= Int(3)),
    )


app = Application("PredictionAlgoGame")


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
    winner_percentage: abi.Uint64,
    name: abi.DynamicBytes,
    option_1: abi.DynamicBytes,
    option_2: abi.DynamicBytes,
    option_3: abi.DynamicBytes,
):
    return Seq(
        func.assert_is_creator(),
        global_master.set(master.get()),
        global_manager.set(manager.get()),
        global_timer.set(timer.get()),
        global_manager_percentage.set(manager_percentage.get()),
        global_winner_percentage.set(winner_percentage.get()),
        global_name.set(name.get()),
        global_option_1.set(option_1.get()),
        global_option_2.set(option_2.get()),
        global_option_3.set(option_3.get()),
    )


@app.external(name="play")
def play(option: abi.Uint64, amount: abi.Uint64):
    payment_transaction = Gtxn[Add(Txn.group_index(), Int(1))]
    master_percentage = config.master_percentage
    manager_percentage = global_manager_percentage.get()
    master_share = Div(Mul(amount.get(), master_percentage), Int(100))
    manager_share = Div(Mul(amount.get(), manager_percentage), Int(100))
    return Seq(
        assert_is_timer_running(),
        assert_is_valid_option(option.get()),
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
        If(option.get() == Int(1))
        .Then(
            global_tickets_1.increment(amount.get()),
            local_tickets_1.increment(Txn.sender(), amount.get()),
        )
        .ElseIf(option.get() == Int(2))
        .Then(
            global_tickets_2.increment(amount.get()),
            local_tickets_2.increment(Txn.sender(), amount.get()),
        )
        .ElseIf(option.get() == Int(3))
        .Then(
            global_tickets_3.increment(amount.get()),
            local_tickets_3.increment(Txn.sender(), amount.get()),
        ),
    )


@app.external(name="finish")
def finish(option: abi.Uint64):
    return Seq(
        assert_is_admin(),
        assert_is_timer_elapsed(),
        assert_is_at_status(Int(0)),
        assert_is_valid_option(option.get()),
        global_winner.set(option.get()),
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


@app.external(name="withdraw")
def withdraw():
    winner_share = Div(
        Mul(global_volume.get(), global_winner_percentage.get()), Int(100)
    )
    tickets_share_1 = Div(
        Mul(winner_share, local_tickets_1.get(Txn.sender())), global_tickets_1.get()
    )
    tickets_share_2 = Div(
        Mul(winner_share, local_tickets_2.get(Txn.sender())), global_tickets_2.get()
    )
    tickets_share_3 = Div(
        Mul(winner_share, local_tickets_3.get(Txn.sender())), global_tickets_3.get()
    )
    return Seq(
        assert_is_timer_elapsed(),
        assert_is_at_status(Int(2)),
        Assert(local_withdrawn.get(Txn.sender()) == Int(0)),
        local_withdrawn.set(Txn.sender(), Int(1)),
        If(global_winner.get() == Int(1))
        .Then(
            func.execute_payment(Txn.sender(), tickets_share_1, Int(0)),
        )
        .ElseIf(global_winner.get() == Int(2))
        .Then(
            func.execute_payment(Txn.sender(), tickets_share_2, Int(0)),
        )
        .ElseIf(global_winner.get() == Int(3))
        .Then(
            func.execute_payment(Txn.sender(), tickets_share_3, Int(0)),
        ),
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
