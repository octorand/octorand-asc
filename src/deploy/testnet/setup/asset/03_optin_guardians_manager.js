require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.guardians.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let opted = config['setup']['optin_guardians_manager'];

        if (!opted) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: sender,
                    assetIndex: config['setup']['guardians']['asset_id'],
                    total: 0,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await testnet.execute(composer);

            config['setup']['optin_guardians_manager'] = true;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in guardians manager');
        }
    } catch (error) {
        console.log(error);
    }
}