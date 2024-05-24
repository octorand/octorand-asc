require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/prime/loader/contract.json')));

        let primes = setup['gen1']['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            if (!prime['application_finalized']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: prime['application_id'],
                    method: chain.method(contract, 'finalize'),
                    methodArgs: [
                        prime['score'],
                        prime['sales'],
                        prime['mints'],
                        prime['renames'],
                        prime['repaints'],
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                });

                await chain.execute(composer);

                prime['application_finalized'] = true;

                primes[i] = prime;

                setup['gen1']['primes'] = primes;
                fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

                console.log('finalized prime application ' + i);
            }
        }

        console.log('finalized prime applications');

    } catch (error) {
        console.log(error);
    }
}
