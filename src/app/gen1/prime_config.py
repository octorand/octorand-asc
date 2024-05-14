import os

from pyteal import *

platform_asset_id = Int(int(os.environ.get("PLATFORM_ASSET_ID")))
platform_asset_reserve = Addr(os.environ.get("PLATFORM_ASSET_RESERVE"))

transform_application_id = Int(int(os.environ.get("TRANSFORM_APPLICATION_ID")))
transform_application_address = Addr(os.environ.get("TRANSFORM_APPLICATION_ADDRESS"))

market_application_id = Int(int(os.environ.get("MARKET_APPLICATION_ID")))
market_application_address = Addr(os.environ.get("MARKET_APPLICATION_ADDRESS"))

seller_price_percentage = Int(90)
admin_price_percentage = Int(10)
config_price = Int(50000000)
transform_price = Int(10000000)
vote_price = Int(500000)
