import os
import json

import gen1_test


def run():

    version = 10
    indent = 4

    approval, clear, contract = gen1_test.router.compile_program(version=version)
    with open("src/app/build/gen1/test/approval.teal", "w") as f:
        f.write(approval)
    with open("src/app/build/gen1/test/clear.teal", "w") as f:
        f.write(clear)
    with open("src/app/build/gen1/test/contract.json", "w") as f:
        f.write(json.dumps(contract.dictify(), indent=indent))


if __name__ == "__main__":
    run()
