require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen1/storage/contract.json')));

        let storage = config['gen1']['contracts']['storage'];
        let prime = config['gen1']['inputs']['prime'];

        if (!storage['initialized']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: storage['application_id'],
                method: helpers.method(contract, 'initialize'),
                methodArgs: [
                    prime['id'],
                    prime['prime_asset_id'],
                    prime['legacy_asset_id'],
                ],
                appForeignAssets: [
                    config['setup']['platform']['asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 4000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            storage['initialized'] = true;

            config['gen1']['contracts']['storage'] = storage;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('called initialize method');
        }

    } catch (error) {
        console.log(error);
    }
}
