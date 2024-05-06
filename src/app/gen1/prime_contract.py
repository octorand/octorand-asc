import func
import prime_config

from pyteal import *
from beaker import *


class GlobalConfig1:
    def __init__(self):
        self.key = Bytes("C-1")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.asset_id = func.GlobalUint(self.key, 8, 8)
        self.platform_asset_id = func.GlobalUint(self.key, 16, 8)
        self.platform_asset_reserve = func.GlobalBytes(self.key, 24, 32)


class GlobalConfig2:
    def __init__(self):
        self.key = Bytes("C-2")
        self.value = func.GlobalBytes(self.key, 0, 120)


class GlobalConfig3:
    def __init__(self):
        self.key = Bytes("C-3")
        self.value = func.GlobalBytes(self.key, 0, 120)


class GlobalConfig4:
    def __init__(self):
        self.key = Bytes("C-4")
        self.value = func.GlobalBytes(self.key, 0, 120)


app = Application("GenOnePrime")

global_config_1 = GlobalConfig1()
global_config_2 = GlobalConfig2()
global_config_3 = GlobalConfig3()
global_config_4 = GlobalConfig4()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_config_1.key),
        func.init_global(global_config_2.key),
        func.init_global(global_config_3.key),
        func.init_global(global_config_4.key),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="init")
def init(id: abi.Uint64, asset_id: abi.Uint64, platform_asset: abi.Asset):
    reserve = platform_asset.params().reserve_address()
    return Seq(
        func.assert_is_creator(),
        global_config_1.id.set(id.get()),
        global_config_1.asset_id.set(asset_id.get()),
        global_config_1.platform_asset_id.set(platform_asset.asset_id()),
        reserve,
        Assert(reserve.hasValue()),
        global_config_1.platform_asset_reserve.set(reserve.value()),
    )
