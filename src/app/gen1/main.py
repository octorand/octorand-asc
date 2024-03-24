import config
import func
import prime

from pyteal import *
from beaker import *


class GlobalState:
    def __init__(self):
        self.one = Int(1)
        self.primes_count = func.GlobalUint(self.one, 0, 8)
        self.platform_asset_id = func.GlobalUint(self.one, 8, 8)
        self.platform_asset_reserve = func.GlobalBytes(self.one, 16, 32)


class PrimeState:
    def __init__(self):
        self.id = func.BoxUint(0, 8)
        self.application_id = func.BoxUint(8, 8)
        self.asset_id = func.BoxUint(16, 8)
        self.legacy_id = func.BoxUint(24, 8)
        self.score = func.BoxUint(32, 8)
        self.health = func.BoxUint(40, 8)
        self.wealth = func.BoxUint(48, 8)
        self.strength = func.BoxUint(56, 8)
        self.theme = func.BoxUint(64, 8)
        self.skin = func.BoxUint(72, 8)
        self.royalties = func.BoxUint(80, 8)
        self.rewards = func.BoxUint(88, 8)
        self.name = func.BoxBytes(96, 8)
        self.description = func.BoxBytes(104, 32)
        self.price = func.BoxUint(136, 8)
        self.owner = func.BoxBytes(144, 32)
        self.likes = func.BoxUint(176, 8)
        self.renames = func.BoxUint(184, 8)
        self.sales = func.BoxUint(192, 8)
        self.mints = func.BoxUint(200, 8)


app = Application("GenOneMain")

global_state = GlobalState()
prime_state = PrimeState()


@Subroutine(TealType.bytes)
def prime_approval_program():
    return Seq(
        precompiled(prime.app).approval_program.binary,
    )


@Subroutine(TealType.bytes)
def prime_clear_program():
    return Seq(
        precompiled(prime.app).clear_program.binary,
    )


@app.create(bare=True)
def create():
    return Seq(
        func.init_global(global_state.one),
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
        func.assert_is_zero(global_state.primes_count.get()),
        func.assert_is_zero(global_state.platform_asset_id.get()),
        func.optin_into_asset(asset.asset_id(), Int(0)),
        global_state.platform_asset_id.set(asset.asset_id()),
        reserve,
        Assert(reserve.hasValue()),
        global_state.platform_asset_reserve.set(reserve.value()),
    )


@app.external(name="create_prime")
def create_prime(
    id: abi.Uint64,
    reserve: abi.Address,
    unit_name: abi.DynamicBytes,
    asset_name: abi.DynamicBytes,
    asset_url: abi.DynamicBytes,
):
    return Seq(
        Assert(id.get() < config.max_primes_count),
        Assert(id.get() == global_state.primes_count.get()),
        func.init_box(id.get(), Int(480)),
        prime_state.id.set(id.get(), id.get()),
        func.create_asset(
            Global.current_application_address(),
            reserve.get(),
            Int(1),
            Int(0),
            unit_name.get(),
            asset_name.get(),
            asset_url.get(),
            Int(0),
        ),
        prime_state.asset_id.set(id.get(), InnerTxn.created_asset_id()),
        func.create_application(
            prime_approval_program(),
            prime_clear_program(),
            Int(0),
            Int(2),
            Int(0),
            Int(0),
            Int(0),
            Int(0),
        ),
        prime_state.application_id.set(id.get(), InnerTxn.created_application_id()),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=prime_state.application_id.get(id.get()),
            method_signature=prime.sync.method_signature(),
            args=[
                func.get_box_bytes(id.get(), Int(0), Int(240)),
            ],
        ),
        global_state.primes_count.increment(Int(1)),
    )


@app.external(name="update_prime")
def update_prime(application: abi.Application):
    return Seq(
        func.assert_is_creator(),
        func.update_application(
            application.application_id(),
            prime_approval_program(),
            prime_clear_program(),
            Int(0),
        ),
    )
