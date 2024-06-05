require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen2/prime/app/contract.json')));

        let max = config['gen2']['inputs']['max'];

        for (let i = 0; i < max; i++) {
            let primes = config['gen2']['inputs']['primes'];

            if (!primes[i]['initialized']) {
                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: primes[i]['application_id'],
                    method: helpers.method(contract, 'initialize'),
                    methodArgs: [
                        primes[i]['id'],
                        config['setup']['platform']['asset_id'],
                        primes[i]['prime_asset_id'],
                        primes[i]['legacy_asset_id'],
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 4000,
                        flatFee: true
                    }
                });

                await testnet.execute(composer);

                primes[i]['initialized'] = true;

                config['gen2']['inputs']['primes'] = primes;
                fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

                console.log('initialize main application ' + i);
            }
        }
    } catch (error) {
        console.log(error);
    }
}