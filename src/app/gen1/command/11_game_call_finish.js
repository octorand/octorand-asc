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

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['game_app']['app_id']),
            method: chain.method(contract, 'finish'),
            methodArgs: [
                connection.player3.addr,
                connection.player4.addr,
                connection.player5.addr,
            ],
            suggestedParams: {
                ...params,
                fee: 4000,
                flatFee: true
            }
        });

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['game_app']['app_id']),
            method: chain.method(contract, 'share'),
            methodArgs: [
                setup['game_app']['state']['app_master'],
                setup['game_app']['state']['app_manager'],
            ],
            suggestedParams: {
                ...params,
                fee: 3000,
                flatFee: true
            }
        });

        await chain.execute(composer);

        console.log('finished game');

    } catch (error) {
        console.log(error);
    }
}