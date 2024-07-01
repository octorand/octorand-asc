require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.legacy.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.legacy);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

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
                    unitName: 'OP2-' + String(primes[i]['id']).padStart(4, '0'),
                    assetName: 'Octo Prime Gen2 #' + String(primes[i]['id']).padStart(4, '0'),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await mainnet.execute(composer);
            let asset_id = response.information['asset-index'];

            primes[i]['legacy_asset_id'] = asset_id;

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('create legacy asset ' + i);
        }
    }

}