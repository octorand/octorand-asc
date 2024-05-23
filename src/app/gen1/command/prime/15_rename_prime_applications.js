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

            if (!prime['renamed']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: prime['application_id'],
                    method: chain.method(contract, 'rename'),
                    methodArgs: [
                        1,
                        68
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

                prime['renamed'] = true;

                primes[i] = prime;

                setup['primes'] = primes;
                fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

                console.log('renamed prime asset ' + i);
            }
        }

        console.log('renamed prime assets');

    } catch (error) {
        console.log(error);
    }
}
