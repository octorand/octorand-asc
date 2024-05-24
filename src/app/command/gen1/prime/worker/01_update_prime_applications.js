require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let primes = setup['gen1']['primes'];

        let version = 1;

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            if (prime['application_version'] < version) {
                let composer = new connection.baseClient.AtomicTransactionComposer();

                let approvalProgram = fs.readFileSync('src/app/build/gen1/prime/worker/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/app/build/gen1/prime/worker/clear.teal', 'utf8');

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                        from: sender,
                        appIndex: prime['application_id'],
                        onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                        approvalProgram: await chain.compile(approvalProgram),
                        clearProgram: await chain.compile(clearProgram),
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                await chain.execute(composer);

                prime['application_version'] = version;

                primes[i] = prime;

                setup['gen1']['primes'] = primes;
                fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

                console.log('updated prime application ' + i);
            }
        }

        console.log('updated prime applications');

    } catch (error) {
        console.log(error);
    }
}
