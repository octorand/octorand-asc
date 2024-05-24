require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/logger/contract.json')));

        let logger = setup['gen1']['logger'];

        if (!logger['event_buy']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: logger['application_id'],
                method: chain.method(contract, 'buy'),
                methodArgs: [
                    Date.now(),
                    1,
                    100,
                    connection.gen1.addr,
                    connection.player.addr
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            logger['event_buy'] = true;

            setup['gen1']['logger'] = logger;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));
        }

        console.log('logged buy event');

    } catch (error) {
        console.log(error);
    }
}
