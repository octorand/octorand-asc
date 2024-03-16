require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player1);

        let setup = JSON.parse(fs.readFileSync('app/play/prediction/algo/setup.json'));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender,
                to: setup['main_app_address'],
                amount: 3000000,
                suggestedParams: {
                    ...params,
                }
            })
        });

        await chain.execute(composer);

        console.log('funded main application');

    } catch (error) {
        console.log(error);
    }
}
