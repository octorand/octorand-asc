require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let application = config['game']['contracts']['deposit'];

        if (!application['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/testnet/game/deposit/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/testnet/game/deposit/clear.teal', 'utf8');

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

            config['game']['contracts']['deposit'] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('created game deposit');
        }
    } catch (error) {
        console.log(error);
    }
}
