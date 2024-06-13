require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen1/prime/optin/contract.json')));

        let application = config['gen1']['contracts']['prime']['optin'];

        if (!application['optin']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'optin'),
                methodArgs: [
                    config['setup']['vault']['asset_id'],
                    config['gen1']['contracts']['prime']['app']['application_id'],
                ],
                appForeignAssets: [
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: config['gen1']['contracts']['prime']['app']['application_address'],
                    amount: 100000,
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
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: config['gen1']['contracts']['prime']['app']['application_address'],
                    assetIndex: config['setup']['vault']['asset_id'],
                    amount: 300,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            application['optin'] = true;

            config['gen1']['contracts']['prime']['optin'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called optin method');
        }
    } catch (error) {
        console.log(error);
    }
}
