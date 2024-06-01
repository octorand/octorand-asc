import env
import func

from pyteal import *


class Config:
    def __init__(self):
        self.seller_market_share = Int(90)
        self.parent_market_share = Int(5)
        self.admin_market_share = Int(5)
        self.rename_price = Int(1000000)
        self.repaint_price = Int(1000000)
        self.optin_price = Int(100000)
        self.rename_score = Int(10)
        self.repaint_score = Int(10)
        self.admin_address = env.addr("ADMIN_ADDRESS")
        self.manager_address = env.addr("GEN2_MANAGER_ADDRESS")


class Prime:
    def __init__(self):
        self.key = Bytes("Prime")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.platform_asset_id = func.GlobalUint(self.key, 8, 8)
        self.prime_asset_id = func.GlobalUint(self.key, 16, 8)
        self.legacy_asset_id = func.GlobalUint(self.key, 24, 8)
        self.parent_application_id = func.GlobalUint(self.key, 32, 8)
        self.theme = func.GlobalUint(self.key, 40, 2)
        self.skin = func.GlobalUint(self.key, 42, 2)
        self.is_founder = func.GlobalUint(self.key, 44, 1)
        self.is_artifact = func.GlobalUint(self.key, 45, 1)
        self.is_pioneer = func.GlobalUint(self.key, 46, 1)
        self.is_explorer = func.GlobalUint(self.key, 47, 1)
        self.score = func.GlobalUint(self.key, 48, 8)
        self.price = func.GlobalUint(self.key, 56, 8)
        self.seller = func.GlobalBytes(self.key, 64, 32)
        self.name = func.GlobalBytes(self.key, 96, 16)


class Event:
    def __init__(self):
        self.design_rename = Itob(Int(100))
        self.design_repaint = Itob(Int(101))
        self.market_list = Itob(Int(110))
        self.market_unlist = Itob(Int(111))
        self.market_buy = Itob(Int(112))
        self.vault_optin = Itob(Int(120))
        self.vault_optout = Itob(Int(121))
        self.wallet_upgrade = Itob(Int(130))
        self.wallet_mint = Itob(Int(131))
        self.wallet_withdraw = Itob(Int(132))
