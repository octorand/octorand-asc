require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['gen1']['contracts']['prime']['app'];

        if (!application['transferred']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: application['application_address'],
                    assetIndex: config['setup']['platform']['asset_id'],
                    amount: 1000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: application['application_address'],
                    amount: 1000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            application['transferred'] = true;

            config['gen1']['contracts']['prime']['app'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('transferred assets');
        }

    } catch (error) {
        console.log(error);
    }
}
