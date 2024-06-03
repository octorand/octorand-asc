require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let core = config['gen1']['contracts']['prime']['core'];
        if (!core['application_id']) {
            let sender = connection.gen1.addr;
            let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

            let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/clear.teal', 'utf8');

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
            let applicationId = response.information['application-index'];

            core['application_id'] = applicationId;
            core['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
            core['application_version'] = 0;

            config['gen1']['contracts']['prime']['core'] = core;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('created prime application');
        }

        let options = ['buy', 'list', 'mint', 'optin', 'optout', 'rename', 'repaint', 'unlist', 'upgrade', 'withdraw'];

        for (let i = 0; i < options.length; i++) {
            let option = options[i];

            let contract = config['gen1']['contracts']['prime'][option];
            if (!contract['application_id']) {
                let sender = connection.admin.addr;
                let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

                let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/clear.teal', 'utf8');

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
                        numGlobalByteSlices: 0,
                        extraPages: 0,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                let response = await devnet.execute(composer);
                let applicationId = response.information['application-index'];

                contract['application_id'] = applicationId;
                contract['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
                contract['application_version'] = 0;

                config['gen1']['contracts']['prime'][option] = contract;
                fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

                console.log('created prime ' + option + ' application');
            }
        }

    } catch (error) {
        console.log(error);
    }
}
