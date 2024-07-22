require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let application = config['launchpad']['takos']['contracts']['item']['app'];

        if (!application['transferred']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: application['application_address'],
                    assetIndex: config['setup']['takos']['asset_id'],
                    amount: 1000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await testnet.execute(composer);

            application['transferred'] = true;

            config['launchpad']['takos']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('transfer assets');
        }
    } catch (error) {
        console.log(error);
    }
}
