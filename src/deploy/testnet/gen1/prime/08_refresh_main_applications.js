require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.gen1.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
    let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen1/prime/app/contract.json')));

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        if (!primes[i]['refreshed']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: primes[i]['application_id'],
                method: helpers.method(contract, 'refresh'),
                methodArgs: [],
                appForeignAssets: [
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            primes[i]['refreshed'] = true;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('refresh main application ' + i);
        }
    }

}