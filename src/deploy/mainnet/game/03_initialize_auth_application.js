require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../chain/mainnet');
const helpers = require('./../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await mainnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/game/deposit/contract.json')));

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

            await mainnet.execute(composer);

            application['initialized'] = true;

            config['game']['contracts']['deposit'] = application;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('called initialize method');
        }
    } catch (error) {
        console.log(error);
    }
}
