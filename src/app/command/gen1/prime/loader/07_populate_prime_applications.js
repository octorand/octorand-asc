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

            if (!prime['application_populated']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: prime['application_id'],
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

                prime['application_populated'] = true;

                primes[i] = prime;

                setup['gen1']['primes'] = primes;
                fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

                console.log('populated prime application ' + i);
            }
        }

        console.log('populated prime applications');

    } catch (error) {
        console.log(error);
    }
}
