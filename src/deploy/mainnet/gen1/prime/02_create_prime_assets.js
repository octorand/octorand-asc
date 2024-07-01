require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.gen1.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        if (!primes[i]['prime_asset_id']) {
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
                    unitName: 'OG1-' + String(primes[i]['id']).padStart(3, '0'),
                    assetName: 'Octorand Gen1 #' + String(primes[i]['id']).padStart(3, '0'),
                    assetURL: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}',
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await mainnet.execute(composer);
            let asset_id = response.information['asset-index'];

            primes[i]['prime_asset_id'] = asset_id;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('create prime asset ' + i);
        }
    }

}