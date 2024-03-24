import func

from pyteal import *
from beaker import *

global_one = Int(1)
global_two = Int(2)

app = Application("GenOnePrime")


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_one),
        func.init_global(global_two),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="sync")
def sync(value: abi.DynamicBytes):
    return Seq(
        func.assert_is_creator(),
        func.set_global_bytes(value.get(), global_one, Int(0), Int(120)),
        func.set_global_bytes(value.get(), global_two, Int(120), Int(120)),
    )
