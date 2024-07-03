require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.gen2.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['gen2']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen2']['inputs']['primes'];

        if (!primes[i]['locked']) {
            let params = await connection.algodClient.getTransactionParams().do();
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: primes[i]['application_address'],
                    assetIndex: primes[i]['prime_asset_id'],
                    amount: 1,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await mainnet.execute(composer);

            primes[i]['locked'] = true;

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('lock main application ' + i);
        }
    }
}