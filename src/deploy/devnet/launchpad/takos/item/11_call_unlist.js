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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/unlist/contract.json')));

        let application = config['launchpad']['takos']['contracts']['item']['unlist'];
        let item = config['launchpad']['takos']['inputs']['item'];

        if (!application['unlisted']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'unlist'),
                methodArgs: [
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                appForeignAssets: [
                    item['item_asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['unlisted'] = true;

            config['launchpad']['takos']['contracts']['item']['unlist'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called unlist method');
        }
    } catch (error) {
        console.log(error);
    }
}
