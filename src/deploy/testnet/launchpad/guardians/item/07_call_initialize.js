require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/launchpad/guardians/item/app/contract.json')));

        let application = config['launchpad']['guardians']['contracts']['item']['app'];
        let item = config['launchpad']['guardians']['inputs']['item'];

        if (!application['initialized']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: application['application_id'],
                method: helpers.method(contract, 'initialize'),
                methodArgs: [
                    item['id'],
                    config['setup']['guardians']['asset_id'],
                    item['item_asset_id'],
                    helpers.bytes(item['name'], 16),
                    item['owner'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            application['initialized'] = true;

            config['launchpad']['guardians']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('called initialize method');
        }
    } catch (error) {
        console.log(error);
    }
}
