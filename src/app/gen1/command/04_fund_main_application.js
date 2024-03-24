require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender,
                to: setup['main_application_address'],
                amount: 1000000,
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        await chain.execute(composer);

        console.log('funded main application');

    } catch (error) {
        console.log(error);
    }
}
