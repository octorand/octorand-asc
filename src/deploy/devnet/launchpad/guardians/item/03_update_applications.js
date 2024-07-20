require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let version = 1;

        let contracts = ['buy', 'claim', 'list', 'mint', 'rename', 'unlist'];

        for (let i = 0; i < contracts.length; i++) {
            let contract = contracts[i];

            let application = config['launchpad']['guardians']['contracts']['item'][contract];

            if (application['application_version'] < version) {
                let approvalProgram = fs.readFileSync('src/build/devnet/launchpad/guardians/item/' + contract + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/launchpad/guardians/item/' + contract + '/clear.teal', 'utf8');

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                        from: sender,
                        appIndex: application['application_id'],
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

                application['application_version'] = version;

                config['launchpad']['guardians']['contracts']['item'][contract] = application;
                fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

                console.log('updated launchpad guardians ' + contract);
            }
        }
    } catch (error) {
        console.log(error);
    }
}
