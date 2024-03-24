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

        let approvalProgram = fs.readFileSync('src/app/gen1/build/main/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/gen1/build/main/clear.teal', 'utf8');

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                from: sender,
                appIndex: Number(setup['main_application_id']),
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
