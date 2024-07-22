require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

    let version = 1;

    let contracts = ['buy', 'claim', 'list', 'mint', 'rename', 'unlist'];

    for (let i = 0; i < contracts.length; i++) {
        let contract = contracts[i];

        let application = config['launchpad']['takos']['contracts']['item'][contract];

        if (application['application_version'] < version) {
            let approvalProgram = fs.readFileSync('src/build/testnet/launchpad/takos/item/' + contract + '/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/testnet/launchpad/takos/item/' + contract + '/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: application['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await testnet.compile(approvalProgram),
                    clearProgram: await testnet.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await testnet.execute(composer);

            application['application_version'] = version;

            config['launchpad']['takos']['contracts']['item'][contract] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('updated item ' + contract);
        }
    }

}