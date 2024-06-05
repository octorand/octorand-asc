require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let version = 1;

        let max = config['gen2']['inputs']['max'];

        for (let i = 0; i < max; i++) {
            let primes = config['gen2']['inputs']['primes'];

            if (primes[i]['application_version'] < version) {
                let approvalProgram = fs.readFileSync('src/build/testnet/gen2/prime/app/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/testnet/gen2/prime/app/clear.teal', 'utf8');

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                        from: sender,
                        appIndex: primes[i]['application_id'],
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

                primes[i]['application_version'] = version;;

                config['gen2']['inputs']['primes'] = primes;
                fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

                console.log('update main application ' + i);
            }
        }
    } catch (error) {
        console.log(error);
    }
}