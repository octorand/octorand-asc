require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.devnet();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/storage/contract.json')));

        let storage = config['gen2']['contracts']['storage'];
        let prime = config['gen2']['inputs']['prime'];

        if (!storage['initialized']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: storage['application_id'],
                method: chain.method(contract, 'initialize'),
                methodArgs: [
                    prime['id'],
                    prime['prime_asset_id'],
                    prime['legacy_asset_id'],
                    config['gen1']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    Number(process.env.PLATFORM_ASSET_ID),
                ],
                suggestedParams: {
                    ...params,
                    fee: 4000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            storage['initialized'] = true;

            config['gen2']['contracts']['storage'] = storage;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called initialize method');
        }

    } catch (error) {
        console.log(error);
    }
}
