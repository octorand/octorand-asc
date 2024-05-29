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

        let vault = config['gen2']['contracts']['vault'];

        if (!vault['application_id']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/build/gen2/vault/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/gen2/vault/clear.teal', 'utf8');

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

            vault['application_id'] = applicationId;
            vault['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
            vault['application_version'] = 0;

            config['gen2']['contracts']['vault'] = vault;
            fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

            console.log('created vault application');
        }

    } catch (error) {
        console.log(error);
    }
}
