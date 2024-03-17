require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player1);

        let setup = JSON.parse(fs.readFileSync('app/play/lottery/algo/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('app/play/lottery/algo/build/game/contract.json')));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['game_app']['app_id']),
            method: chain.method(contract, 'archive'),
            methodArgs: [],
            suggestedParams: {
                ...params,
                fee: 1000,
                flatFee: true
            }
        });

        await chain.execute(composer);

        console.log('archived game');

    } catch (error) {
        console.log(error);
    }
}