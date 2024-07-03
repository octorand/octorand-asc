require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['gen1']['contracts']['prime']['legacy'];

        if (!application['withdraw']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'withdraw'),
                methodArgs: [],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['withdraw'] = true;

            config['gen1']['contracts']['prime']['legacy'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('withdraw legacy app');
        }
    } catch (error) {
        console.log(error);
    }
}
