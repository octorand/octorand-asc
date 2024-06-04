require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let prime = config['gen2']['inputs']['prime'];

        if (!prime['legacy_asset_id']) {
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
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await devnet.execute(composer);
            let asset_id = response.information['asset-index'];

            prime['legacy_asset_id'] = asset_id;

            config['gen2']['inputs']['prime'] = prime;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('create legacy asset');
        };
    } catch (error) {
        console.log(error);
    }
}
