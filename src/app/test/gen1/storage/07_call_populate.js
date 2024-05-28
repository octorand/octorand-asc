require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/storage/contract.json')));

        let storage = setup['gen1']['contracts']['storage'];
        let prime = setup['gen1']['inputs']['prime'];

        if (!storage['populated']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: storage['application_id'],
                method: chain.method(contract, 'populate'),
                methodArgs: [
                    prime['theme'],
                    prime['skin'],
                    prime['is_founder'],
                    prime['is_artifact'],
                    prime['is_pioneer'],
                    prime['is_explorer'],
                    chain.bytes(prime['name'], 8),
                    chain.bytes(prime['description'], 64),
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            storage['populated'] = true;

            setup['gen1']['contracts']['storage'] = storage;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('called populate method');
        }

    } catch (error) {
        console.log(error);
    }
}
