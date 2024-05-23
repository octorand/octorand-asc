require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/gen1/build/prime/contract.json')));

        let primes = setup['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            if (!prime['optin']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: prime['application_id'],
                    method: chain.method(contract, 'optin'),
                    methodArgs: [
                        Number(process.env.VAULT_ASSET_ID),
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 2000,
                        flatFee: true
                    }
                });

                composer.addTransaction({
                    sender: sender,
                    signer: signer,
                    txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: prime['application_address'],
                        amount: 100000,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                composer.addTransaction({
                    sender: sender,
                    signer: signer,
                    txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: prime['application_address'],
                        assetIndex: Number(process.env.VAULT_ASSET_ID),
                        amount: 300,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                await chain.execute(composer);

                prime['optin'] = true;

                primes[i] = prime;

                setup['primes'] = primes;
                fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

                console.log('opted in vault asset ' + i);
            }
        }

        console.log('opted in vault assets');

    } catch (error) {
        console.log(error);
    }
}
