import func

from pyteal import *
from beaker import *


class GlobalState:
    def __init__(self):
        self.one = Int(1)
        self.two = Int(2)
        self.data_one = func.GlobalBytes(self.one, 0, 120)
        self.data_two = func.GlobalBytes(self.two, 0, 120)


app = Application("GenOnePrime")

global_state = GlobalState()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_state.one),
        func.init_global(global_state.two),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="sync")
def sync(one: abi.DynamicBytes, two: abi.DynamicBytes):
    return Seq(
        func.assert_is_creator(),
        # global_state.data_one.set(one.get()),
        # global_state.data_two.set(two.get()),
    )
