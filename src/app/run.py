import os
import json

import env


def run():
    compile("gen1_contract_prime_app", "gen1/prime/app")
    compile("gen1_contract_prime_build", "gen1/prime/build")
    compile("gen1_contract_prime_buy", "gen1/prime/buy")
    compile("gen1_contract_prime_claim", "gen1/prime/claim")
    compile("gen1_contract_prime_list", "gen1/prime/list")
    compile("gen1_contract_prime_mint", "gen1/prime/mint")
    compile("gen1_contract_prime_optin", "gen1/prime/optin")
    compile("gen1_contract_prime_optout", "gen1/prime/optout")
    compile("gen1_contract_prime_rename", "gen1/prime/rename")
    compile("gen1_contract_prime_repaint", "gen1/prime/repaint")
    compile("gen1_contract_prime_unlist", "gen1/prime/unlist")
    compile("gen1_contract_prime_upgrade", "gen1/prime/upgrade")
    compile("gen1_contract_prime_withdraw", "gen1/prime/withdraw")

    compile("gen2_contract_prime_app", "gen2/prime/app")
    compile("gen2_contract_prime_build", "gen2/prime/build")
    compile("gen2_contract_prime_buy", "gen2/prime/buy")
    compile("gen2_contract_prime_claim", "gen2/prime/claim")
    compile("gen2_contract_prime_list", "gen2/prime/list")
    compile("gen2_contract_prime_mint", "gen2/prime/mint")
    compile("gen2_contract_prime_optin", "gen2/prime/optin")
    compile("gen2_contract_prime_optout", "gen2/prime/optout")
    compile("gen2_contract_prime_rename", "gen2/prime/rename")
    compile("gen2_contract_prime_repaint", "gen2/prime/repaint")
    compile("gen2_contract_prime_unlist", "gen2/prime/unlist")
    compile("gen2_contract_prime_upgrade", "gen2/prime/upgrade")
    compile("gen2_contract_prime_withdraw", "gen2/prime/withdraw")


def compile(script, folder):
    contract = __import__(script)
    write(*contract.router.compile_program(version=10), folder)


def write(approval, clear, contract, name):
    folder = "src/build/" + env.env().lower() + "/" + name + "/"
    os.makedirs(os.path.dirname(folder), exist_ok=True)
    with open(folder + "approval.teal", "w") as file:
        file.write(approval)
    with open(folder + "clear.teal", "w") as file:
        file.write(clear)
    with open(folder + "contract.json", "w") as file:
        file.write(json.dumps(contract.dictify(), indent=4))


if __name__ == "__main__":
    run()
