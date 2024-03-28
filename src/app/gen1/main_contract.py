import func
import main_config
import saver_contract

from pyteal import *
from beaker import *
from typing import *


class GlobalConfig:
    def __init__(self):
        self.key = Bytes("Config")
        self.name = func.GlobalBytes(self.key, 0, 16)
        self.primes_count = func.GlobalUint(self.key, 16, 8)
        self.platform_asset_id = func.GlobalUint(self.key, 24, 8)
        self.platform_asset_reserve = func.GlobalBytes(self.key, 32, 32)


class BoxSaver:
    def __init__(self):
        self.value = func.BoxUint(0, 8)


class BoxPrime:
    def __init__(self):
        self.id = func.BoxUint(0, 4)
        self.asset_id = func.BoxUint(4, 8)
        self.legacy_id = func.BoxUint(12, 8)
        self.score = func.BoxUint(20, 8)
        self.health = func.BoxUint(28, 8)
        self.wealth = func.BoxUint(36, 8)
        self.strength = func.BoxUint(44, 8)
        self.royalties = func.BoxUint(52, 8)
        self.rewards = func.BoxUint(60, 8)
        self.price = func.BoxUint(68, 8)
        self.theme = func.BoxUint(76, 2)
        self.skin = func.BoxUint(78, 2)
        self.name = func.BoxBytes(80, 8)
        self.owner = func.BoxBytes(88, 32)
        self.description = func.BoxBytes(120, 32)
        self.likes = func.BoxUint(152, 8)
        self.renames = func.BoxUint(160, 8)
        self.sales = func.BoxUint(168, 8)
        self.mints = func.BoxUint(176, 8)
        self.sync = func.BoxBytes(0, 100)


app = Application("GenOneMain")

global_config = GlobalConfig()
box_saver = BoxSaver()
box_prime = BoxPrime()


@Subroutine(TealType.none)
def prime_sync(id: abi.Uint64, saver_app: abi.Application):
    saver_index = Div(id.get(), main_config.sync_primes_count)
    saver_key = Concat(Bytes("Saver-"), Itob(saver_index))
    prime_key = Concat(Bytes("Prime-"), Itob(id.get()))
    return Seq(
        Assert(box_saver.value.get(saver_key) == saver_app.application_id()),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=box_saver.value.get(saver_key),
            method_signature=saver_contract.sync.method_signature(),
            args=[
                id.encode(),
                box_prime.sync.get(prime_key),
            ],
        ),
    )


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
def init(asset: abi.Asset):
    reserve = asset.params().reserve_address()
    return Seq(
        func.assert_is_creator(),
        func.assert_is_zero(global_config.primes_count.get()),
        func.assert_is_zero(global_config.platform_asset_id.get()),
        func.optin_into_asset(asset.asset_id(), Int(0)),
        global_config.platform_asset_id.set(asset.asset_id()),
        reserve,
        Assert(reserve.hasValue()),
        global_config.platform_asset_reserve.set(reserve.value()),
        global_config.name.set(main_config.name),
    )


@app.external(name="init_saver")
def init_saver(index: abi.Uint64, saver_app: abi.Application):
    saver_key = Concat(Bytes("Saver-"), Itob(index.get()))
    return Seq(
        func.assert_is_creator(),
        func.init_box(saver_key, Int(8)),
        box_saver.value.set(saver_key, saver_app.application_id()),
    )


@app.external(name="create_prime")
def create_prime(
    id: abi.Uint64,
    unit_name: abi.DynamicBytes,
    asset_name: abi.DynamicBytes,
    asset_url: abi.DynamicBytes,
    saver_app: abi.Application,
):
    prime_key = Concat(Bytes("Prime-"), Itob(id.get()))
    return Seq(
        func.assert_is_creator(),
        Assert(id.get() < main_config.max_primes_count),
        Assert(id.get() == global_config.primes_count.get()),
        func.init_box(prime_key, Int(500)),
        box_prime.id.set(prime_key, id.get()),
        func.create_asset(
            Global.current_application_address(),
            Global.current_application_address(),
            Int(1),
            Int(0),
            unit_name.get(),
            asset_name.get(),
            asset_url.get(),
            Int(0),
        ),
        box_prime.asset_id.set(prime_key, InnerTxn.created_asset_id()),
        global_config.primes_count.increment(Int(1)),
        prime_sync(id, saver_app),
    )


@app.external(name="update_prime")
def update_prime(
    id: abi.Uint64,
    legacy_id: abi.Uint64,
    score: abi.Uint64,
    health: abi.Uint64,
    wealth: abi.Uint64,
    strength: abi.Uint64,
    theme: abi.Uint64,
    skin: abi.Uint64,
    name: abi.StaticBytes[Literal[8]],
    description: abi.StaticBytes[Literal[32]],
    saver_app: abi.Application,
):
    prime_key = Concat(Bytes("Prime-"), Itob(id.get()))
    return Seq(
        func.assert_is_creator(),
        box_prime.legacy_id.set(prime_key, legacy_id.get()),
        box_prime.score.set(prime_key, score.get()),
        box_prime.health.set(prime_key, health.get()),
        box_prime.wealth.set(prime_key, wealth.get()),
        box_prime.strength.set(prime_key, strength.get()),
        box_prime.theme.set(prime_key, theme.get()),
        box_prime.skin.set(prime_key, skin.get()),
        box_prime.name.set(prime_key, name.get()),
        box_prime.description.set(prime_key, description.get()),
        prime_sync(id, saver_app),
    )


@app.external(name="update_prime_asset")
def update_prime_asset(asset: abi.Asset, reserve: abi.Account):
    return Seq(
        func.assert_is_creator(),
        func.update_asset(
            asset.asset_id(),
            Global.current_application_address(),
            reserve.address(),
            Txn.note(),
            Int(0),
        ),
    )
