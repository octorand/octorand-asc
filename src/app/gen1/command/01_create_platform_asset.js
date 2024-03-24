require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

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
                unitName: "TEST",
                assetName: "Test",
                suggestedParams: {
                    ...params
                }
            })
        });

        let response = await chain.execute(composer);
        let assetId = response.information['asset-index'];

        setup['platform_asset_id'] = assetId;
        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('created platform asset');

    } catch (error) {
        console.log(error);
    }
}
