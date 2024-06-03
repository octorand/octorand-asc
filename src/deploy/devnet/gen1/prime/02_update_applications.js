require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let version = 1;

        let core = config['gen1']['contracts']['prime']['core'];
        if (core['application_version'] < version) {
            let sender = connection.admin.addr;
            let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

            let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: core['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await devnet.compile(approvalProgram),
                    clearProgram: await devnet.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            core['application_version'] = version;

            config['gen1']['contracts']['prime']['core'] = core;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('updated prime application');
        }

        let options = ['buy', 'list', 'mint', 'optin', 'optout', 'rename', 'repaint', 'unlist', 'upgrade', 'withdraw'];

        for (let i = 0; i < options.length; i++) {
            let option = options[i];

            let contract = config['gen1']['contracts']['prime'][option];
            if (contract['application_version'] < version) {
                let sender = connection.admin.addr;
                let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

                let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/clear.teal', 'utf8');

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                        from: sender,
                        appIndex: contract['application_id'],
                        onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                        approvalProgram: await devnet.compile(approvalProgram),
                        clearProgram: await devnet.compile(clearProgram),
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                await devnet.execute(composer);

                contract['application_version'] = version;

                config['gen1']['contracts']['prime'][option] = contract;
                fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

                console.log('updated prime ' + option + ' application');
            }
        }

    } catch (error) {
        console.log(error);
    }
}
