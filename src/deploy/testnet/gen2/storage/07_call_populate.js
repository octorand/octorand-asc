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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen2/storage/contract.json')));

        let storage = config['gen2']['contracts']['storage'];
        let prime = config['gen2']['inputs']['prime'];

        if (!storage['populated']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: storage['application_id'],
                method: helpers.method(contract, 'populate'),
                methodArgs: [
                    prime['theme'],
                    prime['skin'],
                    prime['is_founder'],
                    prime['is_artifact'],
                    prime['is_pioneer'],
                    prime['is_explorer'],
                    helpers.bytes(prime['name'], 16),
                    helpers.bytes(prime['description'], 64),
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            storage['populated'] = true;

            config['gen2']['contracts']['storage'] = storage;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('called populate method');
        }

    } catch (error) {
        console.log(error);
    }
}
