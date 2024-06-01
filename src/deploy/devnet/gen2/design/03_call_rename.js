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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/design/contract.json')));

        let design = config['gen2']['contracts']['design'];
        let prime = config['gen2']['inputs']['prime'];

        if (!design['renamed']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: design['application_id'],
                method: helpers.method(contract, 'rename'),
                methodArgs: [
                    1,
                    68,
                    config['gen2']['contracts']['storage']['application_id'],
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
                    assetIndex: config['setup']['platform']['asset_id'],
                    amount: 2000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: design['application_id'],
                method: helpers.method(contract, 'rename'),
                methodArgs: [
                    15,
                    89,
                    config['gen2']['contracts']['storage']['application_id'],
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
                    assetIndex: config['setup']['platform']['asset_id'],
                    amount: 1000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            design['renamed'] = true;

            config['gen2']['contracts']['design'] = design;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called rename method');
        }

    } catch (error) {
        console.log(error);
    }
}
