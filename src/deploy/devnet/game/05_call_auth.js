require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');
const helpers = require('./../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/game/auth/contract.json')));

        let application = config['game']['contracts']['auth'];

        let key = 'ABCD'.repeat(12);

        if (!application['authenticated']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'auth'),
                methodArgs: [
                    helpers.bytes(key, 48),
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['authenticated'] = true;

            config['game']['contracts']['auth'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called auth method');
        }
    } catch (error) {
        console.log(error);
    }
}
