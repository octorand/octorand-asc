require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.guardians.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/unlist/contract.json')));

        let application = config['launchpad']['guardians']['contracts']['item']['unlist'];
        let prime = config['launchpad']['guardians']['inputs']['item'];

        if (!application['unmoved']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'unlist'),
                methodArgs: [
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id']
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
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: connection.admin.addr,
                    assetIndex: prime['prime_asset_id'],
                    amount: 1,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            application['unmoved'] = true;

            config['launchpad']['guardians']['contracts']['item']['unlist'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called unlist method');
        }
    } catch (error) {
        console.log(error);
    }
}
