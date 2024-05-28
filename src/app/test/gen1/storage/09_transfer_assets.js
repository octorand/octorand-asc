require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/app/test/config.json'));

        let storage = config['gen1']['contracts']['storage'];

        if (!storage['transferred']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: storage['application_address'],
                    assetIndex: Number(process.env.PLATFORM_ASSET_ID),
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
                    to: storage['application_address'],
                    amount: 1000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            storage['transferred'] = true;

            config['gen1']['contracts']['storage'] = storage;
            fs.writeFileSync('src/app/test/config.json', JSON.stringify(config, null, 4));

            console.log('transferred storage assets');
        }

    } catch (error) {
        console.log(error);
    }
}
