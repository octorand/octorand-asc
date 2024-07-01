require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {
    try {
        let connection = await mainnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

        let platform = config['setup']['platform'];

        if (!platform['asset_id']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeAssetCreateTxnWithSuggestedParamsFromObject({
                    from: sender,
                    total: 1000000000000,
                    decimals: 6,
                    defaultFrozen: false,
                    manager: sender,
                    reserve: sender,
                    unitName: "OCTO",
                    assetName: "Octorand",
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await mainnet.execute(composer);
            let asset_id = response.information['asset-index'];

            platform['asset_id'] = asset_id;
            platform['manager'] = sender;
            platform['reserve'] = sender;

            config['setup']['platform'] = platform;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('create platform asset');
        }
    } catch (error) {
        console.log(error);
    }
}