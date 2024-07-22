require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.takos.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.takos.manager);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let application = config['launchpad']['takos']['contracts']['item']['app'];

        if (!application['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/testnet/launchpad/takos/item/app/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/testnet/launchpad/takos/item/app/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                    from: sender,
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await testnet.compile(approvalProgram),
                    clearProgram: await testnet.compile(clearProgram),
                    numLocalInts: 0,
                    numLocalByteSlices: 0,
                    numGlobalInts: 0,
                    numGlobalByteSlices: 1,
                    extraPages: 0,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await testnet.execute(composer);
            let application_id = response.information['application-index'];

            application['application_id'] = application_id;
            application['application_address'] = connection.baseClient.getApplicationAddress(application_id);
            application['application_version'] = 0;

            config['launchpad']['takos']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('created launchpad takos app');
        }
    } catch (error) {
        console.log(error);
    }
}
