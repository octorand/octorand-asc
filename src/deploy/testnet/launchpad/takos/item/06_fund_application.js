require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let application = config['launchpad']['takos']['contracts']['item']['app'];

        if (!application['funded']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: application['application_address'],
                    amount: 300000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await testnet.execute(composer);

            application['funded'] = true;

            config['launchpad']['takos']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('funded takos item app');
        }
    } catch (error) {
        console.log(error);
    }
}
