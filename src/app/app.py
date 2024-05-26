import os

import gen1_contract_design
import gen1_contract_market
import gen1_contract_storage
import gen1_contract_vault
import gen1_contract_wallet


from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", os.environ.get("ALGO_SERVER"))

    gen1_design_app_spec = gen1_contract_design.app.build(client)
    gen1_design_app_spec.export("src/app/build/gen1/design")

    gen1_market_app_spec = gen1_contract_market.app.build(client)
    gen1_market_app_spec.export("src/app/build/gen1/market")

    gen1_storage_app_spec = gen1_contract_storage.app.build(client)
    gen1_storage_app_spec.export("src/app/build/gen1/storage")

    gen1_vault_app_spec = gen1_contract_vault.app.build(client)
    gen1_vault_app_spec.export("src/app/build/gen1/vault")

    gen1_wallet_app_spec = gen1_contract_wallet.app.build(client)
    gen1_wallet_app_spec.export("src/app/build/gen1/wallet")


if __name__ == "__main__":
    run()
