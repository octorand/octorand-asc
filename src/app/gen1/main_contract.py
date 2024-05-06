import func
import main_config
import prime_contract

from pyteal import *
from beaker import *


class GlobalConfig1:
    def __init__(self):
        self.key = Bytes("C-1")
        self.primes_count = func.GlobalUint(self.key, 0, 8)
        self.platform_asset_id = func.GlobalUint(self.key, 8, 8)
        self.platform_asset_reserve = func.GlobalBytes(self.key, 16, 32)


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


app = Application("GenOneMain")

global_config_1 = GlobalConfig1()
global_config_2 = GlobalConfig2()
global_config_3 = GlobalConfig3()
global_config_4 = GlobalConfig4()


@Subroutine(TealType.bytes)
def prime_approval_program():
    return Seq(
        precompiled(prime_contract.app).approval_program.binary,
    )


@Subroutine(TealType.bytes)
def prime_clear_program():
    return Seq(
        precompiled(prime_contract.app).clear_program.binary,
    )


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
def init(asset: abi.Asset):
    reserve = asset.params().reserve_address()
    return Seq(
        func.assert_is_creator(),
        func.assert_is_zero(global_config_1.primes_count.get()),
        func.assert_is_zero(global_config_1.platform_asset_id.get()),
        func.optin_into_asset(asset.asset_id(), Int(0)),
        global_config_1.platform_asset_id.set(asset.asset_id()),
        reserve,
        Assert(reserve.hasValue()),
        global_config_1.platform_asset_reserve.set(reserve.value()),
    )


@app.external(name="create_prime")
def create_prime(
    id: abi.Uint64,
    unit_name: abi.DynamicBytes,
    asset_name: abi.DynamicBytes,
    asset_url: abi.DynamicBytes,
):
    created_asset_id = abi.make(abi.Uint64)
    created_application_id = abi.make(abi.Uint64)
    return Seq(
        Assert(id.get() < main_config.max_primes_count),
        Assert(id.get() == global_config_1.primes_count.get()),
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
        created_asset_id.set(InnerTxn.created_asset_id()),
        func.create_application(
            prime_approval_program(),
            prime_clear_program(),
            Int(0),
            Int(4),
            Int(0),
            Int(0),
            Int(0),
            Int(0),
        ),
        created_application_id.set(InnerTxn.created_application_id()),
        InnerTxnBuilder.ExecuteMethodCall(
            app_id=created_application_id.get(),
            method_signature=prime_contract.init.method_signature(),
            args=[id, created_asset_id],
        ),
        global_config_1.primes_count.increment(Int(1)),
    )


@app.external(name="update_prime_app")
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
