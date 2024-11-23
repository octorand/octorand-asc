require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');
const helpers = require('./../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/game/deposit/contract.json')));

        let application = config['game']['contracts']['deposit'];

        if (!application['initialized']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'initialize'),
                methodArgs: [
                    config['setup']['platform']['asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['initialized'] = true;

            config['game']['contracts']['deposit'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called initialize method');
        }
    } catch (error) {
        console.log(error);
    }
}
