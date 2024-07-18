import env
import func

from pyteal import *


class GuardiansConfig:
    def __init__(self):
        self.seller_market_share = Int(95)
        self.artist_market_share = Int(3)
        self.admin_market_share = Int(2)
        self.rename_price = Int(3000000)
        self.rename_admin_share = Int(10)
        self.rename_treasury_share = Int(30)
        self.rename_burner_share = Int(60)
        self.admin_address = env.addr("ADMIN_ADDRESS")
        self.manager_address = env.addr("LAUNCHPAD_GUARDIANS_MANAGER_ADDRESS")
        self.artist_address = env.addr("LAUNCHPAD_GUARDIANS_ARTIST_ADDRESS")
        self.treasury_address = env.addr("LAUNCHPAD_GUARDIANS_TREASURY_ADDRESS")
        self.burner_address = env.addr("BURNER_APPLICATION_ADDRESS")


class TakosConfig:
    def __init__(self):
        self.seller_market_share = Int(95)
        self.artist_market_share = Int(3)
        self.admin_market_share = Int(2)
        self.rename_price = Int(3000000)
        self.rename_admin_share = Int(10)
        self.rename_treasury_share = Int(30)
        self.rename_burner_share = Int(60)
        self.admin_address = env.addr("ADMIN_ADDRESS")
        self.manager_address = env.addr("LAUNCHPAD_TAKOS_MANAGER_ADDRESS")
        self.artist_address = env.addr("LAUNCHPAD_TAKOS_ARTIST_ADDRESS")
        self.treasury_address = env.addr("LAUNCHPAD_TAKOS_TREASURY_ADDRESS")
        self.burner_address = env.addr("BURNER_APPLICATION_ADDRESS")


class Item:
    def __init__(self):
        self.key = Bytes("P")
        self.id = func.GlobalUint(self.key, 0, 8)
        self.platform_asset_id = func.GlobalUint(self.key, 8, 8)
        self.item_asset_id = func.GlobalUint(self.key, 16, 8)
        self.rewards = func.GlobalUint(self.key, 24, 8)
        self.price = func.GlobalUint(self.key, 32, 8)
        self.seller = func.GlobalBytes(self.key, 40, 32)
        self.owner = func.GlobalBytes(self.key, 72, 32)
        self.name = func.GlobalBytes(self.key, 104, 16)


class Event:
    def __init__(self):
        self.item_buy = Bytes("imby")
        self.item_claim = Bytes("imcl")
        self.item_list = Bytes("imls")
        self.item_mint = Bytes("immt")
        self.item_rename = Bytes("imrn")
        self.item_unlist = Bytes("imul")
