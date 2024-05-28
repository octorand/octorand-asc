require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/wallet/contract.json')));

        let wallet = setup['gen1']['contracts']['wallet'];
        let prime = setup['gen1']['inputs']['prime'];

        if (!wallet['withdrawn']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: wallet['application_id'],
                method: chain.method(contract, 'withdraw'),
                methodArgs: [
                    200,
                    setup['gen1']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            wallet['withdrawn'] = true;

            setup['gen1']['contracts']['wallet'] = wallet;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('called withdraw method');
        }

    } catch (error) {
        console.log(error);
    }
}
