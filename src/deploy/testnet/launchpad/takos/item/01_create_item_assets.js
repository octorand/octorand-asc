require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.takos.manager.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.takos.manager);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

    let max = config['launchpad']['takos']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['takos']['inputs']['items'];

        if (!items[i]['asset_id']) {
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
                    unitName: 'TAKO' + String(items[i]['id']).padStart(3, '0'),
                    assetName: 'Tako #' + String(items[i]['id']).padStart(3, '0'),
                    assetURL: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}',
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await testnet.execute(composer);
            let asset_id = response.information['asset-index'];

            items[i]['asset_id'] = asset_id;

            config['launchpad']['takos']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('create item asset ' + i);
        }
    }

}