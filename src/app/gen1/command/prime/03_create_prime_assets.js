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

            if (!prime['prime_asset_id']) {

                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeAssetCreateTxnWithSuggestedParamsFromObject({
                        from: sender,
                        total: 1,
                        decimals: 0,
                        defaultFrozen: false,
                        manager: sender,
                        reserve: sender,
                        unitName: 'TG1-' + String(i).padStart(3, '0'),
                        assetName: 'Test Gen1 #' + String(i).padStart(3, '0'),
                        assetURL: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}',
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                let response = await chain.execute(composer);
                let assetId = response.information['asset-index'];

                prime['prime_asset_id'] = assetId;

                primes[i] = prime;

                setup['primes'] = primes;
                fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

                console.log('created prime asset ' + i);
            }
        }

        console.log('created prime assets');

    } catch (error) {
        console.log(error);
    }
}
