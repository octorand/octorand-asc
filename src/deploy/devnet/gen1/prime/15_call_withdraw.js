require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen1/prime/withdraw/contract.json')));

        let application = config['gen1']['contracts']['prime']['withdraw'];
        let prime = config['gen1']['inputs']['prime'];

        if (!application['withdrawn']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'withdraw'),
                methodArgs: [
                    200,
                    config['gen1']['contracts']['prime']['app']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['withdrawn'] = true;

            config['gen1']['contracts']['prime']['withdraw'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called withdraw method');
        }
    } catch (error) {
        console.log(error);
    }
}
