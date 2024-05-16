import os

from pyteal import *

platform_asset_id = Int(int(os.environ.get("PLATFORM_ASSET_ID")))
platform_asset_reserve = Addr(os.environ.get("PLATFORM_ASSET_RESERVE"))

seller_price_percentage = Int(90)
admin_price_percentage = Int(10)

rename_price = Int(10000000)
repaint_price = Int(10000000)
