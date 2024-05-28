require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/market/contract.json')));

        let market = setup['gen1']['contracts']['market'];
        let prime = setup['gen1']['inputs']['prime'];

        if (!market['unlisted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: market['application_id'],
                method: chain.method(contract, 'unlist'),
                methodArgs: [
                    setup['gen1']['contracts']['storage']['application_id'],
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

            setup['gen1']['contracts']['market'] = market;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('called unlist method');
        }

    } catch (error) {
        console.log(error);
    }
}
