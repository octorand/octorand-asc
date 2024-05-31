require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let vault = config['gen2']['contracts']['vault'];

        let version = 1;

        if (vault['application_version'] < version) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/build/devnet/gen2/vault/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen2/vault/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: vault['application_id'],
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

            vault['application_version'] = version;

            config['gen2']['contracts']['vault'] = vault;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('updated vault application');
        }

    } catch (error) {
        console.log(error);
    }
}
