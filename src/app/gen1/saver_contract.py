import func
import saver_config

from pyteal import *
from beaker import *
from typing import *


class GlobalConfig:
    def __init__(self):
        self.key = Bytes("Config")
        self.name = func.GlobalBytes(self.key, 0, 16)
        self.starting_prime_id = func.GlobalUint(self.key, 16, 8)
        self.ending_prime_id = func.GlobalUint(self.key, 24, 8)
        self.master_app_id = func.GlobalUint(self.key, 32, 8)


app = Application("GenOneSaver")

global_config = GlobalConfig()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_config.key),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="init")
def init(
    starting_prime_id: abi.Uint64,
    ending_prime_id: abi.Uint64,
    master_app_id: abi.Uint64,
):
    id_range = Minus(ending_prime_id.get(), starting_prime_id.get())
    return Seq(
        func.assert_is_creator(),
        Assert(starting_prime_id.get() < ending_prime_id.get()),
        Assert(id_range == saver_config.max_primes_count),
        Assert(master_app_id.get() > Int(0)),
        global_config.starting_prime_id.set(starting_prime_id.get()),
        global_config.ending_prime_id.set(ending_prime_id.get()),
        global_config.master_app_id.set(master_app_id.get()),
        global_config.name.set(saver_config.name),
    )


@app.external(name="sync")
def sync(prime_id: abi.Uint32, value: abi.StaticBytes[Literal[120]]):
    prime_key = Concat(Bytes("P-"), Itob(prime_id.get()))
    return Seq(
        Assert(Global.caller_app_id() == global_config.master_app_id.get()),
        Assert(prime_id.get() >= global_config.starting_prime_id.get()),
        Assert(prime_id.get() < global_config.ending_prime_id.get()),
        App.globalPut(prime_key, value.get()),
    )
