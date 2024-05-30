require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));

        let design = config['gen1']['contracts']['design'];

        if (!design['application_id']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/build/gen1/design/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/gen1/design/clear.teal', 'utf8');

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

            design['application_id'] = applicationId;
            design['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
            design['application_version'] = 0;

            config['gen1']['contracts']['design'] = design;
            fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

            console.log('created design application');
        }

    } catch (error) {
        console.log(error);
    }
}
