require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let storage = config['gen2']['contracts']['storage'];

        if (!storage['funded']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: storage['application_address'],
                    amount: 400000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await devnet.execute(composer);

            storage['funded'] = true;

            config['gen2']['contracts']['storage'] = storage;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('funded storage application');
        }

    } catch (error) {
        console.log(error);
    }
}
