require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = 'YVG5656ZA7M4QQUZHUJWV4VO6CM432LDUTKKYL6CJJLQVLSRHALMZ4MFKQ';
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.legacy);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let version = 1;

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        if (primes[i]['legacy_application_version'] < version) {
            let params = await connection.algodClient.getTransactionParams().do();
            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/build/mainnet/gen1/prime/legacy/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/mainnet/gen1/prime/legacy/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: primes[i]['legacy_application_id'],
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

            primes[i]['legacy_application_version'] = version;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('updated legacy application ' + i);
        }
    }
}