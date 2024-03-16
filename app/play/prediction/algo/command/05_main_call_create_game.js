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

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('app/play/prediction/algo/build/main/contract.json')));

        let timer = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
        let managerPercentage = 6;
        let winnerPercentage = 90;
        let name = new Uint8Array(Buffer.from(('Test Prediction' + ' '.repeat(32)).substring(0, 32)));
        let option1 = new Uint8Array(Buffer.from(('One' + ' '.repeat(24)).substring(0, 24)));
        let option2 = new Uint8Array(Buffer.from(('Two' + ' '.repeat(24)).substring(0, 24)));
        let option3 = new Uint8Array(Buffer.from(('Three' + ' '.repeat(24)).substring(0, 24)));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['main_app_id']),
            method: chain.method(contract, 'create_game'),
            methodArgs: [
                timer,
                managerPercentage,
                winnerPercentage,
                name,
                option1,
                option2,
                option3,
            ],
            suggestedParams: {
                ...params,
            }
        });

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender,
                to: setup['main_app_address'],
                amount: 2000000,
                suggestedParams: {
                    ...params,
                }
            })
        });

        let response = await chain.execute(composer);

        let appId = response.information['inner-txns'][0]['application-index'];
        setup['game_app']['app_id'] = appId;

        fs.writeFileSync('app/play/prediction/algo/setup.json', JSON.stringify(setup, null, 4));

        console.log('created game');

    } catch (error) {
        console.log(error);
    }
}
