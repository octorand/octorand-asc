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

        let max = config['gen1']['inputs']['max'];

        for (let i = 0; i < max; i++) {
            let primes = config['gen1']['inputs']['primes'];

            if (!primes[i]['funded']) {
                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: application['application_id'],
                    method: helpers.method(contract, 'initialize'),
                    methodArgs: [
                        prime['id'],
                        config['setup']['platform']['asset_id'],
                        prime['prime_asset_id'],
                        prime['legacy_asset_id'],
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 4000,
                        flatFee: true
                    }
                });

                await testnet.execute(composer);

                primes[i]['funded'] = true;

                config['gen1']['inputs']['primes'] = primes;
                fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

                console.log('fund main application ' + i);
            }
        }
    } catch (error) {
        console.log(error);
    }
}