require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let prime = config['gen1']['inputs']['prime'];

        if (!prime['prime_asset_id']) {
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
                    unitName: 'TGL1-' + String(prime['id']).padStart(3, '0'),
                    assetName: 'Test Gen1 Legacy #' + String(prime['id']).padStart(3, '0'),
                    assetURL: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}',
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await devnet.execute(composer);
            let asset_id = response.information['asset-index'];

            prime['prime_asset_id'] = asset_id;

            config['gen1']['inputs']['prime'] = prime;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('create prime asset');
        };
    } catch (error) {
        console.log(error);
    }
}
