require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['game']['contracts']['deposit'];

        if (!application['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/devnet/game/deposit/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/game/deposit/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                    from: sender,
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await devnet.compile(approvalProgram),
                    clearProgram: await devnet.compile(clearProgram),
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

            let response = await devnet.execute(composer);
            let application_id = response.information['application-index'];

            application['application_id'] = application_id;
            application['application_address'] = connection.baseClient.getApplicationAddress(application_id);
            application['application_version'] = 0;

            config['game']['contracts']['deposit'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('created game deposit');
        }
    } catch (error) {
        console.log(error);
    }
}
