import env
import func

from pyteal import *


class Config:
    def __init__(self):
        self.seller_market_share = Int(90)
        self.admin_market_share = Int(10)
        self.rename_price = Int(10000000)
        self.repaint_price = Int(10000000)
        self.optin_price = Int(100000)
        self.rename_score = Int(100)
        self.repaint_score = Int(100)
        self.admin_address = env.addr("ADMIN_ADDRESS")
        self.manager_address = env.addr("GEN1_MANAGER_ADDRESS")


class Prime:
    def __init__(self):
        self.key_1 = Bytes("P1")
        self.key_2 = Bytes("P2")
        self.id = func.GlobalUint(self.key_1, 0, 8)
        self.platform_asset_id = func.GlobalUint(self.key_1, 8, 8)
        self.prime_asset_id = func.GlobalUint(self.key_1, 16, 8)
        self.legacy_asset_id = func.GlobalUint(self.key_1, 24, 8)
        self.parent_application_id = func.GlobalUint(self.key_1, 32, 8)
        self.theme = func.GlobalUint(self.key_1, 40, 2)
        self.skin = func.GlobalUint(self.key_1, 42, 2)
        self.is_founder = func.GlobalUint(self.key_1, 44, 1)
        self.is_artifact = func.GlobalUint(self.key_1, 45, 1)
        self.is_pioneer = func.GlobalUint(self.key_1, 46, 1)
        self.is_explorer = func.GlobalUint(self.key_1, 47, 1)
        self.score = func.GlobalUint(self.key_1, 48, 8)
        self.price = func.GlobalUint(self.key_1, 56, 8)
        self.seller = func.GlobalBytes(self.key_1, 64, 32)
        self.sales = func.GlobalUint(self.key_1, 96, 2)
        self.drains = func.GlobalUint(self.key_1, 98, 2)
        self.transforms = func.GlobalUint(self.key_1, 100, 2)
        self.vaults = func.GlobalUint(self.key_1, 102, 2)
        self.name = func.GlobalBytes(self.key_1, 104, 8)
        self.owner = func.GlobalBytes(self.key_2, 0, 32)
        self.rewards = func.GlobalUint(self.key_2, 32, 8)
        self.royalties = func.GlobalUint(self.key_2, 40, 8)


class Event:
    def __init__(self):
        self.prime_buy = Bytes("prby")
        self.prime_claim = Bytes("prcl")
        self.prime_list = Bytes("prls")
        self.prime_mint = Bytes("prmt")
        self.prime_optin = Bytes("proi")
        self.prime_optout = Bytes("proo")
        self.prime_rename = Bytes("prrn")
        self.prime_repaint = Bytes("prrp")
        self.prime_unlist = Bytes("prul")
        self.prime_upgrade = Bytes("prug")
        self.prime_withdraw = Bytes("prwd")
