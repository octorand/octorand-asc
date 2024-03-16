import main
import game

from algosdk import v2client


def run():
    client = v2client.algod.AlgodClient("", "https://testnet-api.algonode.cloud")

    main_app_spec = main.app.build(client)
    main_app_spec.export("app/play/prediction/algo/build/main")

    game_app_spec = game.app.build(client)
    game_app_spec.export("app/play/prediction/algo/build/game")


if __name__ == "__main__":
    run()
