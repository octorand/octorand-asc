require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.takos.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.takos.manager);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/list/contract.json')));

        let application = config['launchpad']['takos']['contracts']['item']['list'];
        let item = config['launchpad']['takos']['inputs']['item'];

        if (!application['relisted']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'list'),
                methodArgs: [
                    item['price'],
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: config['launchpad']['takos']['contracts']['item']['app']['application_address'],
                    assetIndex: item['item_asset_id'],
                    amount: 1,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            application['relisted'] = true;

            config['launchpad']['takos']['contracts']['item']['list'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called list method');
        }
    } catch (error) {
        console.log(error);
    }
}
