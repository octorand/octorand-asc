import func
import prime_config

from pyteal import *
from beaker import *


class GlobalConfig:
    def __init__(self):
        self.key = Bytes("Config")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.asset_id = func.GlobalUint(self.key, 8, 8)


app = Application("GenOnePrime")

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
def init(id: abi.Uint64, asset_id: abi.Uint64):
    return Seq(
        func.assert_is_creator(),
        global_config.id.set(id.get()),
        global_config.asset_id.set(asset_id.get()),
    )
