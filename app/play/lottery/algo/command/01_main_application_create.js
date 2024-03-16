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

        let approvalProgram = fs.readFileSync('app/play/lottery/algo/build/main/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('app/play/lottery/algo/build/main/clear.teal', 'utf8');

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                from: sender,
                onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                approvalProgram: await chain.compile(approvalProgram, false),
                clearProgram: await chain.compile(clearProgram, false),
                numLocalInts: 0,
                numLocalByteSlices: 0,
                numGlobalInts: 0,
                numGlobalByteSlices: 0,
                extraPages: 1,
                appArgs: [],
                suggestedParams: {
                    ...params
                }
            })
        });

        let response = await chain.execute(composer);

        let appId = response.information['application-index'];
        setup['main_app_id'] = appId;

        fs.writeFileSync('app/play/lottery/algo/setup.json', JSON.stringify(setup, null, 4));

        console.log('created main application');

    } catch (error) {
        console.log(error);
    }
}
