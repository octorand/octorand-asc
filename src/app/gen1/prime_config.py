import os

from pyteal import *

admin_address = Addr(os.environ.get("ADMIN_ADDRESS"))

platform_asset_id = Int(int(os.environ.get("PLATFORM_ASSET_ID")))
platform_asset_reserve = Addr(os.environ.get("PLATFORM_ASSET_RESERVE"))

seller_market_share = Int(90)
admin_market_share = Int(10)

rename_price = Int(10000000)
repaint_price = Int(10000000)
describe_price = Int(10000000)
optin_price = Int(100000)
