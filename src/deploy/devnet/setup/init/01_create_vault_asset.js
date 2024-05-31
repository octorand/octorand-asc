require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {

        let connection = await chain.devnet();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let vault = config['setup']['vault'];

        if (!vault['asset_id']) {

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
                    unitName: "VAULT",
                    assetName: "Vault",
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await chain.execute(composer);
            let assetId = response.information['asset-index'];

            vault['asset_id'] = assetId;
            vault['manager'] = sender;
            vault['reserve'] = sender;

            config['setup']['vault'] = vault;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('create vault asset');
        }

    } catch (error) {
        console.log(error);
    }
}