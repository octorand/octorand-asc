import main
import saver_contract

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", "https://testnet-api.algonode.cloud")

    # main_app_spec = main.app.build(client)
    # main_app_spec.export("src/app/gen1/build/main")

    # prime_app_spec = prime.app.build(client)
    # prime_app_spec.export("src/app/gen1/build/prime")

    saver_app_spec = saver_contract.app.build(client)
    saver_app_spec.export("src/app/gen1/build/saver")


if __name__ == "__main__":
    run()
