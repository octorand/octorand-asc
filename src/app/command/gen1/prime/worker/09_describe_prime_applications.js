require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/prime/worker/contract.json')));

        let primes = setup['gen1']['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            if (!prime['described']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: prime['application_id'],
                    method: chain.method(contract, 'describe'),
                    methodArgs: [
                        chain.bytes('Updated ' + prime['description'], 64),
                    ],
                    appForeignAssets: [
                        prime['prime_asset_id']
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                });

                composer.addTransaction({
                    sender: sender,
                    signer: signer,
                    txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: connection.admin.addr,
                        assetIndex: Number(process.env.PLATFORM_ASSET_ID),
                        amount: 10000000,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                await chain.execute(composer);

                prime['described'] = true;

                primes[i] = prime;

                setup['gen1']['primes'] = primes;
                fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

                console.log('described prime asset ' + i);
            }
        }

        console.log('described prime assets');

    } catch (error) {
        console.log(error);
    }
}
