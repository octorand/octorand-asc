require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/gen2/market/contract.json')));

        let market = config['gen2']['contracts']['market'];
        let prime = config['gen2']['inputs']['prime'];

        if (!market['unlisted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: market['application_id'],
                method: chain.method(contract, 'unlist'),
                methodArgs: [
                    config['gen2']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            market['unlisted'] = true;

            config['gen2']['contracts']['market'] = market;
            fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

            console.log('called unlist method');
        }

    } catch (error) {
        console.log(error);
    }
}
