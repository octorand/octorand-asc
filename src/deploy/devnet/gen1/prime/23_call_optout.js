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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen1/prime/optout/contract.json')));

        let application = config['gen1']['contracts']['prime']['optout'];
        let prime = config['gen1']['inputs']['prime'];

        if (!application['optout']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'optout'),
                methodArgs: [
                    config['setup']['vault']['asset_id'],
                    config['gen1']['contracts']['prime']['app']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['optout'] = true;

            config['gen1']['contracts']['prime']['optout'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called optout method');
        }
    } catch (error) {
        console.log(error);
    }
}
