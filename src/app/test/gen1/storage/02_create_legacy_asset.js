require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));

        let prime = setup['gen1']['inputs']['prime'];

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

            let response = await chain.execute(composer);
            let assetId = response.information['asset-index'];

            prime['legacy_asset_id'] = assetId;

            setup['gen1']['inputs']['prime'] = prime;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('create legacy asset');
        };

    } catch (error) {
        console.log(error);
    }
}
