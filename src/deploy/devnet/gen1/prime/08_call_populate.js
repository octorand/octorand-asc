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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen1/prime/contract.json')));

        let core = config['gen1']['contracts']['prime']['core'];
        let prime = config['gen1']['inputs']['prime'];

        if (!core['populated']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: core['application_id'],
                method: helpers.method(contract, 'populate'),
                methodArgs: [
                    prime['theme'],
                    prime['skin'],
                    prime['is_founder'],
                    prime['is_artifact'],
                    prime['is_pioneer'],
                    prime['is_explorer'],
                    prime['score'],
                    helpers.bytes(prime['name'], 8),
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            core['populated'] = true;

            config['gen1']['contracts']['prime']['core'] = core;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called populate method');
        }

    } catch (error) {
        console.log(error);
    }
}
