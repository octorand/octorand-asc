require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player2);

        let setup = JSON.parse(fs.readFileSync('app/play/prediction/algo/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('app/play/prediction/algo/build/game/contract.json')));

        let name = new Uint8Array(Buffer.from(('Test Prediction Updated' + ' '.repeat(32)).substring(0, 32)));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['game_app']['app_id']),
            method: chain.method(contract, 'update_name'),
            methodArgs: [
                name
            ],
            suggestedParams: {
                ...params,
            }
        });

        await chain.execute(composer);

        console.log('updated game name');

    } catch (error) {
        console.log(error);
    }
}
