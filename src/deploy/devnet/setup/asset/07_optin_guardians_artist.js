require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.guardians.artist.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.artist);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let opted = config['setup']['optin_guardians_artist'];

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

            await devnet.execute(composer);

            config['setup']['optin_guardians_artist'] = true;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in guardians artist');
        }
    } catch (error) {
        console.log(error);
    }
}