import func
import os

from pyteal import *

admin_address = Addr(os.environ.get("ADMIN_ADDRESS"))
manager_address = Addr(os.environ.get("GEN1_ADDRESS"))

main_application_id = Int(int(os.environ.get("GEN1_PRIME_MAIN_APPLICATION_ID")))

platform_asset_id = Int(int(os.environ.get("PLATFORM_ASSET_ID")))
platform_asset_reserve = Addr(os.environ.get("PLATFORM_ASSET_RESERVE"))

seller_market_share = Int(90)
admin_market_share = Int(10)

rename_price = Int(10000000)
repaint_price = Int(10000000)
describe_price = Int(10000000)
optin_price = Int(100000)


class Config1:
    def __init__(self):
        self.key = Bytes("Config1")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.prime_asset_id = func.GlobalUint(self.key, 8, 8)
        self.legacy_asset_id = func.GlobalUint(self.key, 16, 8)
        self.parent_application_id = func.GlobalUint(self.key, 24, 8)
        self.theme = func.GlobalUint(self.key, 32, 2)
        self.skin = func.GlobalUint(self.key, 34, 2)
        self.is_founder = func.GlobalUint(self.key, 36, 1)
        self.is_artifact = func.GlobalUint(self.key, 37, 1)
        self.is_pioneer = func.GlobalUint(self.key, 38, 1)
        self.is_explorer = func.GlobalUint(self.key, 39, 1)
        self.score = func.GlobalUint(self.key, 40, 8)
        self.sales = func.GlobalUint(self.key, 48, 4)
        self.mints = func.GlobalUint(self.key, 52, 4)
        self.renames = func.GlobalUint(self.key, 56, 4)
        self.repaints = func.GlobalUint(self.key, 60, 4)
        self.price = func.GlobalUint(self.key, 64, 8)
        self.seller = func.GlobalBytes(self.key, 72, 32)
        self.name = func.GlobalBytes(self.key, 104, 8)


class Config2:
    def __init__(self):
        self.key = Bytes("Config2")
        self.description = func.GlobalBytes(self.key, 0, 64)
