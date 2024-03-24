import config
import func
import saver
import prime

from pyteal import *
from beaker import *

global_one = Int(1)
global_primes_count = saver.GlobalUint(global_one, 0, 8)
global_platform_asset_id = saver.GlobalUint(global_one, 8, 8)
global_platform_asset_reserve = saver.GlobalBytes(global_one, 16, 32)

box_id = saver.BoxUint(0, 8)
box_application_id = saver.BoxUint(8, 8)
box_asset_id = saver.BoxUint(16, 8)
box_legacy_id = saver.BoxUint(24, 8)
box_score = saver.BoxUint(32, 8)
box_health = saver.BoxUint(40, 8)
box_wealth = saver.BoxUint(48, 8)
box_strength = saver.BoxUint(56, 8)
box_theme = saver.BoxUint(64, 8)
box_skin = saver.BoxUint(72, 8)
box_royalties = saver.BoxUint(80, 8)
box_rewards = saver.BoxUint(88, 8)
box_name = saver.BoxBytes(96, 8)
box_description = saver.BoxBytes(104, 32)
box_price = saver.BoxUint(136, 8)
box_owner = saver.BoxBytes(144, 32)
box_likes = saver.BoxUint(176, 8)
box_transforms = saver.BoxUint(184, 8)
box_sales = saver.BoxUint(192, 8)
box_mints = saver.BoxUint(200, 8)


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


app = Application("GenOneMain")


@app.update(bare=True)
def update():
    return Seq(
        func.assert_is_creator(),
    )


@app.external(name="init")
def init(platform_asset_id: abi.Uint64, platform_asset_reserve: abi.Address):
    return Seq(
        func.assert_is_creator(),
        func.assert_is_zero(global_primes_count.get()),
        func.assert_is_zero(global_platform_asset_id.get()),
        global_platform_asset_id.set(platform_asset_id.get()),
        global_platform_asset_reserve.set(platform_asset_reserve.get()),
        func.optin_into_asset(platform_asset_id.get(), Int(0)),
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
        Assert(id.get() == global_primes_count.get()),
        func.init_box(id.get(), Int(480)),
        box_id.set(id.get(), id.get()),
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
        box_asset_id.set(id.get(), InnerTxn.created_asset_id()),
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
        box_application_id.set(id.get(), InnerTxn.created_application_id()),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=box_application_id.get(id.get()),
            method_signature=prime.sync.method_signature(),
            args=[
                func.get_box_bytes(id.get(), Int(0), Int(240)),
            ],
        ),
        global_primes_count.increment(Int(1)),
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
