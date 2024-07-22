require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.guardians.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let item = config['launchpad']['guardians']['inputs']['item'];

        if (!item['item_asset_id']) {
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
                    unitName: 'LG-' + String(item['id']).padStart(3, '0'),
                    assetName: 'Test Launchpad #' + String(item['id']).padStart(3, '0'),
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

            item['item_asset_id'] = asset_id;

            config['launchpad']['guardians']['inputs']['item'] = item;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('create guardians item asset');
        };
    } catch (error) {
        console.log(error);
    }
}
