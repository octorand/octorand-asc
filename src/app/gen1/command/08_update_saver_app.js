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

        let approvalProgram = fs.readFileSync('src/app/gen1/build/saver/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/gen1/build/saver/clear.teal', 'utf8');

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                from: sender,
                appIndex: Number(setup['saver_app']['id']),
                onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                approvalProgram: await chain.compile(approvalProgram, false),
                clearProgram: await chain.compile(clearProgram, false),
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        await chain.execute(composer);

        console.log('updated saver app');

    } catch (error) {
        console.log(error);
    }
}
