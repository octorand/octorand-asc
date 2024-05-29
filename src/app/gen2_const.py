import func
import os

from pyteal import *

admin_address = Addr(os.environ.get("ADMIN_ADDRESS"))
manager_address = Addr(os.environ.get("GEN2_MANAGER_ADDRESS"))

market_application_id = Int(int(os.environ.get("GEN2_MARKET_APPLICATION_ID")))
design_application_id = Int(int(os.environ.get("GEN2_DESIGN_APPLICATION_ID")))
vault_application_id = Int(int(os.environ.get("GEN2_VAULT_APPLICATION_ID")))
wallet_application_id = Int(int(os.environ.get("GEN2_WALLET_APPLICATION_ID")))

platform_asset_id = Int(int(os.environ.get("PLATFORM_ASSET_ID")))
platform_asset_reserve = Addr(os.environ.get("PLATFORM_ASSET_RESERVE"))

seller_market_share = Int(90)
parent_market_share = Int(5)
admin_market_share = Int(5)

rename_price = Int(1000000)
repaint_price = Int(1000000)
describe_price = Int(1000000)
optin_price = Int(100000)


class Prime:
    def __init__(self):
        self.key_1 = Bytes("P1")
        self.key_2 = Bytes("P2")
        self.id = func.GlobalUint(self.key_1, 0, 8)
        self.prime_asset_id = func.GlobalUint(self.key_1, 8, 8)
        self.legacy_asset_id = func.GlobalUint(self.key_1, 16, 8)
        self.parent_application_id = func.GlobalUint(self.key_1, 24, 8)
        self.theme = func.GlobalUint(self.key_1, 32, 2)
        self.skin = func.GlobalUint(self.key_1, 34, 2)
        self.is_founder = func.GlobalUint(self.key_1, 36, 1)
        self.is_artifact = func.GlobalUint(self.key_1, 37, 1)
        self.is_pioneer = func.GlobalUint(self.key_1, 38, 1)
        self.is_explorer = func.GlobalUint(self.key_1, 39, 1)
        self.score = func.GlobalUint(self.key_1, 40, 8)
        self.sales = func.GlobalUint(self.key_1, 48, 4)
        self.mints = func.GlobalUint(self.key_1, 52, 4)
        self.renames = func.GlobalUint(self.key_1, 56, 4)
        self.repaints = func.GlobalUint(self.key_1, 60, 4)
        self.price = func.GlobalUint(self.key_1, 64, 8)
        self.seller = func.GlobalBytes(self.key_1, 72, 32)
        self.name = func.GlobalBytes(self.key_1, 104, 16)
        self.description = func.GlobalBytes(self.key_2, 0, 64)


class Event:
    def __init__(self):
        self.design_rename = Itob(Int(100))
        self.design_repaint = Itob(Int(101))
        self.design_describe = Itob(Int(102))
        self.market_list = Itob(Int(110))
        self.market_unlist = Itob(Int(111))
        self.market_buy = Itob(Int(112))
        self.vault_optin = Itob(Int(120))
        self.vault_optout = Itob(Int(121))
        self.wallet_upgrade = Itob(Int(130))
        self.wallet_mint = Itob(Int(131))
        self.wallet_withdraw = Itob(Int(132))
