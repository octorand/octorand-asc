require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function (environment) {
    try {

        let connection = await chain.get(environment);
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let opted = config['setup']['optin_gen1'];

        if (!opted) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: sender,
                    assetIndex: config['setup']['platform']['asset_id'],
                    total: 0,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            config['setup']['optin_gen1'] = true;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in gen1');
        }

    } catch (error) {
        console.log(error);
    }
}