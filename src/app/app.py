import os

import gen1_prime_loader
import gen1_prime_worker

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", os.environ.get("ALGO_SERVER"))

    gen1_prime_loader_app_spec = gen1_prime_loader.app.build(client)
    gen1_prime_loader_app_spec.export("src/app/build/gen1/prime/loader")

    gen1_prime_worker_app_spec = gen1_prime_worker.app.build(client)
    gen1_prime_worker_app_spec.export("src/app/build/gen1/prime/worker")


if __name__ == "__main__":
    run()
