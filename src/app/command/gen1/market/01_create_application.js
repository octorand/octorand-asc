require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let market = setup['gen1']['market'];

        if (!market['application_id']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/app/build/gen1/market/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/app/build/gen1/market/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                    from: sender,
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await chain.compile(approvalProgram),
                    clearProgram: await chain.compile(clearProgram),
                    numLocalInts: 0,
                    numLocalByteSlices: 0,
                    numGlobalInts: 0,
                    numGlobalByteSlices: 0,
                    extraPages: 0,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await chain.execute(composer);
            let applicationId = response.information['application-index'];

            market['application_id'] = applicationId;
            market['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
            market['application_version'] = 0;

            setup['gen1']['market'] = market;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));
        }

        console.log('created market application');

    } catch (error) {
        console.log(error);
    }
}
