import func
import prime_config

from pyteal import *
from beaker import *


class GlobalConfig1:
    def __init__(self):
        self.key = Bytes("C1")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.prime_asset_id = func.GlobalUint(self.key, 8, 8)
        self.legacy_asset_id = func.GlobalUint(self.key, 16, 8)


class GlobalConfig2:
    def __init__(self):
        self.key = Bytes("C2")


app = Application("GenOnePrime")

global_config_1 = GlobalConfig1()
global_config_2 = GlobalConfig2()


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_config_1.key),
        func.init_global(global_config_2.key),
    )


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="init")
def init(
    id: abi.Uint64,
    platform_asset: abi.Asset,
    prime_asset: abi.Asset,
    legacy_asset: abi.Asset,
):
    return Seq(
        func.assert_is_creator(),
        Assert(platform_asset.asset_id() == prime_config.platform_asset_id),
        global_config_1.id.set(id.get()),
        global_config_1.prime_asset_id.set(prime_asset.asset_id()),
        global_config_1.legacy_asset_id.set(legacy_asset.asset_id()),
        func.optin_into_asset(platform_asset.asset_id(), Int(0)),
        func.optin_into_asset(prime_asset.asset_id(), Int(0)),
        func.optin_into_asset(legacy_asset.asset_id(), Int(0)),
    )
