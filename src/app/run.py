import os
import json

import env


def run():
    gen1_prime = [
        "app",
        "build",
        "buy",
        "claim",
        "legacy",
        "list",
        "mint",
        "optin",
        "optout",
        "rename",
        "repaint",
        "unlist",
        "upgrade",
        "withdraw",
    ]
    for x in gen1_prime:
        compile(
            "gen1_contract_prime_" + x,
            "gen1/prime/" + x,
        )

    gen2_prime = [
        "app",
        "build",
        "buy",
        "claim",
        "legacy",
        "list",
        "mint",
        "optin",
        "optout",
        "rename",
        "repaint",
        "unlist",
        "upgrade",
        "withdraw",
    ]
    for x in gen2_prime:
        compile(
            "gen2_contract_prime_" + x,
            "gen2/prime/" + x,
        )

    launchpad_guardians_item = [
        "app",
        "buy",
        "claim",
        "legacy",
        "list",
        "mint",
        "rename",
        "unlist",
    ]
    for x in launchpad_guardians_item:
        compile(
            "launchpad_contract_guardians_item_" + x,
            "launchpad/guardians/item/" + x,
        )

    launchpad_takos_item = [
        "app",
        "buy",
        "claim",
        "legacy",
        "list",
        "mint",
        "rename",
        "unlist",
    ]
    for x in launchpad_takos_item:
        compile(
            "launchpad_contract_takos_item_" + x,
            "launchpad/takos/item/" + x,
        )


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
