require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player2);

        let setup = JSON.parse(fs.readFileSync('app/play/lottery/algo/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('app/play/lottery/algo/build/game/contract.json')));

        let timer = Math.floor(Date.now() / 1000) + 20;

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['game_app']['app_id']),
            method: chain.method(contract, 'update_timer'),
            methodArgs: [
                timer
            ],
            suggestedParams: {
                ...params,
            }
        });

        await chain.execute(composer);

        await new Promise(sleep => setTimeout(sleep, 30000));

        console.log('updated game timer');

    } catch (error) {
        console.log(error);
    }
}