require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/rename/contract.json')));

        let application = config['launchpad']['guardians']['contracts']['item']['rename'];
        let item = config['launchpad']['guardians']['inputs']['item'];

        if (!application['renamed']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'rename'),
                methodArgs: [
                    helpers.bytes(item['name'] + '-2', 16),
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                appForeignAssets: [
                    item['item_asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 5000,
                    flatFee: true
                }
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: process.env.DEVNET_BURNER_APPLICATION_ADDRESS,
                    assetIndex: config['setup']['guardians']['asset_id'],
                    amount: Math.floor(3000000 * 0.6),
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
                    to: connection.guardians.treasury.addr,
                    assetIndex: config['setup']['guardians']['asset_id'],
                    amount: Math.floor(3000000 * 0.3),
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
                    to: connection.admin.addr,
                    assetIndex: config['setup']['guardians']['asset_id'],
                    amount: Math.floor(3000000 * 0.1),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            application['renamed'] = true;

            config['launchpad']['guardians']['contracts']['item']['rename'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called rename method');
        }
    } catch (error) {
        console.log(error);
    }
}
