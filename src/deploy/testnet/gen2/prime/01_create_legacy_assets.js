require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.legacy.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.legacy);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let max = config['gen2']['inputs']['max'];

        for (let i = 0; i < max; i++) {
            let primes = config['gen2']['inputs']['primes'];

            if (!primes[i]['legacy_asset_id']) {
                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeAssetCreateTxnWithSuggestedParamsFromObject({
                        from: sender,
                        total: 1,
                        decimals: 0,
                        defaultFrozen: false,
                        manager: sender,
                        reserve: sender,
                        unitName: 'OCTO-' + String(primes[i]['id']).padStart(3, '0'),
                        assetName: 'Octorand #' + String(primes[i]['id']).padStart(3, '0'),
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                let response = await testnet.execute(composer);
                let asset_id = response.information['asset-index'];

                primes[i]['legacy_asset_id'] = asset_id;

                config['gen2']['inputs']['primes'] = primes;
                fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

                console.log('create legacy asset ' + i);
            }
        }
    } catch (error) {
        console.log(error);
    }
}