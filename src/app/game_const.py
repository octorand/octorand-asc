import env
import func

from pyteal import *


class Config:
    def __init__(self):
        self.admin_address = env.addr("ADMIN_ADDRESS")


class AuthStatistic:
    def __init__(self):
        self.key = Bytes("P")
        self.auth_count = func.GlobalUint(self.key, 0, 8)


class DepositStatistic:
    def __init__(self):
        self.key = Bytes("P")
        self.platform_asset_id = func.GlobalUint(self.key, 0, 8)
        self.deposit_count = func.GlobalUint(self.key, 8, 8)
        self.deposit_amount = func.GlobalUint(self.key, 16, 8)


class Event:
    def __init__(self):
        self.game_auth = Bytes("gmat")
        self.game_deposit = Bytes("gmdp")
