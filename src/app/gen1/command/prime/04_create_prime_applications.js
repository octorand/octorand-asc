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

            if (!prime['application_id']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                let approvalProgram = fs.readFileSync('src/app/gen1/build/prime/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/app/gen1/build/prime/clear.teal', 'utf8');

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                        from: sender,
                        onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                        approvalProgram: await chain.compile(approvalProgram),
                        clearProgram: await chain.compile(clearProgram),
                        numLocalInts: 0,
                        numLocalByteSlices: 0,
                        numGlobalInts: 0,
                        numGlobalByteSlices: 2,
                        extraPages: 0,
                        note: connection.baseClient.encodeUint64(prime['id']),
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                let response = await chain.execute(composer);
                let applicationId = response.information['application-index'];

                prime['application_id'] = applicationId;
                prime['application_address'] = connection.baseClient.getApplicationAddress(applicationId);
                prime['application_version'] = 0;

                primes[i] = prime;

                setup['primes'] = primes;
                fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

                console.log('created prime application ' + i);
            }
        }

        console.log('created prime applications');

    } catch (error) {
        console.log(error);
    }
}
