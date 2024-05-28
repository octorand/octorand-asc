import os
import json

import gen1_contract_design
import gen1_contract_market
import gen1_contract_storage
import gen1_contract_vault
import gen1_contract_wallet


def run():
    write(*gen1_contract_design.router.compile_program(version=10), "design")
    write(*gen1_contract_market.router.compile_program(version=10), "market")
    write(*gen1_contract_storage.router.compile_program(version=10), "storage")
    write(*gen1_contract_vault.router.compile_program(version=10), "vault")
    write(*gen1_contract_wallet.router.compile_program(version=10), "wallet")


def write(
    approval,
    clear,
    contract,
    name,
):
    folder = "src/build/gen1/" + name + "/"
    with open(folder + "approval.teal", "w") as file:
        file.write(approval)
    with open(folder + "clear.teal", "w") as file:
        file.write(clear)
    with open(folder + "contract.json", "w") as file:
        file.write(json.dumps(contract.dictify(), indent=4))


if __name__ == "__main__":
    run()
