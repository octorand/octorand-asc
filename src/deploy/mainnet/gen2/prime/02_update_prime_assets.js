require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.gen2.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['gen2']['inputs']['max'];

    let version = 1;

    for (let i = 0; i < max; i++) {
        let primes = config['gen2']['inputs']['primes'];

        if (!primes[i]['asset_version'] || primes[i]['asset_version'] < version) {
            let params = await connection.algodClient.getTransactionParams().do();
            let composer = new connection.baseClient.AtomicTransactionComposer();

            let properties = {};
            properties['name'] = primes[i]['name'];

            let metadata = {
                standard: 'arc69',
                properties: properties
            };

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeAssetConfigTxnWithSuggestedParamsFromObject({
                    from: sender,
                    assetIndex: primes[i]['prime_asset_id'],
                    note: helpers.bytes(JSON.stringify(metadata)),
                    manager: sender,
                    reserve: primes[i]['asset_reserve'],
                    strictEmptyAddressChecking: false,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await mainnet.execute(composer);

            primes[i]['asset_version'] = version;

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('update prime asset ' + i);
        }
    }
}