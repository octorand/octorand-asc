require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let version = 1;

    let contracts = ['buy', 'claim', 'list', 'mint', 'rename', 'unlist'];

    for (let i = 0; i < contracts.length; i++) {
        let contract = contracts[i];

        let application = config['launchpad']['guardians']['contracts']['item'][contract];

        if (application['application_version'] < version) {
            let approvalProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/' + contract + '/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/' + contract + '/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: application['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await mainnet.compile(approvalProgram),
                    clearProgram: await mainnet.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await mainnet.execute(composer);

            application['application_version'] = version;

            config['launchpad']['guardians']['contracts']['item'][contract] = application;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('updated item ' + contract);
        }
    }

}