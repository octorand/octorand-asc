require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = setup['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            if (!prime['application_funded']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: prime['application_address'],
                        amount: 300000,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                await chain.execute(composer);

                prime['application_funded'] = true;

                primes[i] = prime;

                setup['primes'] = primes;
                fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

                console.log('funded prime application ' + i);
            }
        }

        console.log('funded prime applications');

    } catch (error) {
        console.log(error);
    }
}
