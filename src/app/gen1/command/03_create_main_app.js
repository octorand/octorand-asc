require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        let approvalProgram = fs.readFileSync('src/app/gen1/build/main/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/gen1/build/main/clear.teal', 'utf8');

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
                numGlobalByteSlices: 4,
                extraPages: 0,
                appArgs: [],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        let response = await chain.execute(composer);
        let applicationId = response.information['application-index'];

        let info = await connection.indexerClient.lookupApplications(applicationId).do();
        let data = {
            id: applicationId,
            address: connection.baseClient.getApplicationAddress(Number(info['application']['id'])),
            creator: info['application']['params']['creator']
        };

        setup['main_app'] = data;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('created main app');

    } catch (error) {
        console.log(error);
    }
}
