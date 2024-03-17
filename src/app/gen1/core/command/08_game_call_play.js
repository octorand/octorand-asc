require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();

        let setup = JSON.parse(fs.readFileSync('app/play/lottery/algo/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('app/play/lottery/algo/build/game/contract.json')));

        for (let i = 3; i <= 5; i++) {
            let sender = connection['player' + i].addr;
            let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection['player' + i]);

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: Number(setup['game_app']['app_id']),
                method: chain.method(contract, 'play'),
                methodArgs: [
                    100000 * i
                ],
                suggestedParams: {
                    ...params,
                }
            });

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: setup['game_app']['app_address'],
                    amount: 100000 * i,
                    suggestedParams: {
                        ...params,
                    }
                })
            });

            await chain.execute(composer);
        }

        console.log('called game play');

    } catch (error) {
        console.log(error);
    }
}