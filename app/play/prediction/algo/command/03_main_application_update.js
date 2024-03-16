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

        let approvalProgram = fs.readFileSync('app/play/prediction/algo/build/main/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('app/play/prediction/algo/build/main/clear.teal', 'utf8');

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                from: sender,
                appIndex: Number(setup['main_app_id']),
                onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                approvalProgram: await chain.compile(approvalProgram, false),
                clearProgram: await chain.compile(clearProgram, false),
                suggestedParams: {
                    ...params
                }
            })
        });

        await chain.execute(composer);

        console.log('updated main application');

    } catch (error) {
        console.log(error);
    }
}
