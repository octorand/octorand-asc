import main_contract
import saver_contract

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", "https://testnet-api.algonode.cloud")

    main_app_spec = main_contract.app.build(client)
    main_app_spec.export("src/app/gen1/build/main")

    saver_app_spec = saver_contract.app.build(client)
    saver_app_spec.export("src/app/gen1/build/saver")


if __name__ == "__main__":
    run()
