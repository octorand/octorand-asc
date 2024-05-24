import os

import gen1_prime_main
import gen1_prime_storage

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", os.environ.get("ALGO_SERVER"))

    gen1_prime_main_app_spec = gen1_prime_main.app.build(client)
    gen1_prime_main_app_spec.export("src/app/build/gen1/prime/main")

    gen1_prime_storage_app_spec = gen1_prime_storage.app.build(client)
    gen1_prime_storage_app_spec.export("src/app/build/gen1/prime/storage")


if __name__ == "__main__":
    run()
