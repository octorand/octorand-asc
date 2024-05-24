import os

import prime_contract

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", os.environ.get("ALGO_SERVER"))

    prime_app_spec = prime_contract.app.build(client)
    prime_app_spec.export("src/app/gen1/build/prime")


if __name__ == "__main__":
    run()
