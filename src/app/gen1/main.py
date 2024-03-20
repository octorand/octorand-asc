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
box_likes = saver.BoxUint(40, 8)
box_theme = saver.BoxUint(48, 8)
box_skin = saver.BoxUint(56, 8)
box_royalties = saver.BoxUint(64, 8)
box_rewards = saver.BoxUint(72, 8)
box_transforms = saver.BoxUint(80, 8)
box_sales = saver.BoxUint(88, 8)
box_mints = saver.BoxUint(96, 8)
box_price = saver.BoxUint(104, 8)
box_name = saver.BoxBytes(112, 8)
box_description = saver.BoxBytes(120, 32)
box_owner = saver.BoxBytes(152, 32)
box_is_artifact = saver.BoxUint(184, 2)
box_is_pioneer = saver.BoxUint(186, 2)
box_is_founder = saver.BoxUint(188, 2)
box_is_winner = saver.BoxUint(190, 2)


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
def init(asset: abi.Asset):
    return Seq(
        func.assert_is_creator(),
        func.assert_is_zero(global_primes_count.get()),
        func.assert_is_zero(global_platform_asset_id.get()),
        global_platform_asset_id.set(asset.asset_id()),
        global_platform_asset_reserve.set(asset.params().reserve_address().value()),
    )


@app.external(name="create_prime")
def create_prime(
    reserve: abi.Address,
    unit_name: abi.DynamicBytes,
    asset_name: abi.DynamicBytes,
    asset_url: abi.DynamicBytes,
):
    prime_id = ScratchVar(TealType.uint64)
    created_asset_id = ScratchVar(TealType.uint64)
    created_application_id = ScratchVar(TealType.uint64)
    return Seq(
        Assert(global_primes_count.get() < config.max_primes_count),
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
        created_asset_id.store(InnerTxn.created_asset_id()),
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
        created_application_id.store(InnerTxn.created_application_id()),
        prime_id.store(global_primes_count.get()),
        func.init_box(prime_id.load(), Int(480)),
        box_id.set(prime_id.load(), prime_id.load()),
        box_application_id.set(prime_id.load(), created_application_id.load()),
        box_asset_id.set(prime_id.load(), created_asset_id.load()),
        global_primes_count.increment(Int(1)),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=created_application_id.load(),
            method_signature=prime.sync.method_signature(),
            args=[
                func.get_box_bytes(prime_id.load(), Int(0), Int(120)),
                func.get_box_bytes(prime_id.load(), Int(120), Int(120)),
            ],
        ),
    )


@app.external(name="update_prime")
def update_prime(application: abi.Application):
    return Seq(
        func.assert_is_creator(),
        func.update_application(
            application.application_id(),
            game_approval_program(),
            game_clear_program(),
            Int(0),
        ),
    )
