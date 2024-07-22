require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let takos = config['setup']['takos'];

        if (!takos['asset_id']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeAssetCreateTxnWithSuggestedParamsFromObject({
                    from: sender,
                    total: 180000000000,
                    decimals: 6,
                    defaultFrozen: false,
                    manager: sender,
                    reserve: sender,
                    unitName: "TAKO",
                    assetName: "Takos",
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await testnet.execute(composer);
            let asset_id = response.information['asset-index'];

            takos['asset_id'] = asset_id;
            takos['manager'] = sender;
            takos['reserve'] = sender;

            config['setup']['takos'] = takos;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('create takos asset');
        }
    } catch (error) {
        console.log(error);
    }
}