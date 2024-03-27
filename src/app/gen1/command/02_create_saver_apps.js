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

        let approvalProgram = fs.readFileSync('src/app/gen1/build/saver/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/gen1/build/saver/clear.teal', 'utf8');

        saverApps = [];

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
                numGlobalByteSlices: 1,
                extraPages: 0,
                appArgs: [],
                note: chain.bytes('0'),
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        let response = await chain.execute(composer);
        let applicationId = response.information['application-index'];
        saverApps.push(applicationId);

        composer = new connection.baseClient.AtomicTransactionComposer();

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
                numGlobalByteSlices: 1,
                extraPages: 0,
                appArgs: [],
                note: chain.bytes('1'),
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        response = await chain.execute(composer);
        applicationId = response.information['application-index'];
        saverApps.push(applicationId);

        setup['saver_apps'] = saverApps;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('created saver apps');

    } catch (error) {
        console.log(error);
    }
}
