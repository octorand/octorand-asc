require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen2/prime/app/contract.json')));

        let max = config['gen2']['inputs']['max'];

        for (let i = 0; i < max; i++) {
            let primes = config['gen2']['inputs']['primes'];

            if (!primes[i]['populated']) {
                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addMethodCall({
                    sender: sender,
                    signer: signer,
                    appID: primes[i]['application_id'],
                    method: helpers.method(contract, 'populate'),
                    methodArgs: [
                        primes[i]['theme'],
                        primes[i]['skin'],
                        primes[i]['is_founder'],
                        primes[i]['is_artifact'],
                        primes[i]['is_pioneer'],
                        primes[i]['is_explorer'],
                        primes[i]['score'],
                        primes[i]['sales'],
                        primes[i]['drains'],
                        primes[i]['transforms'],
                        helpers.bytes(primes[i]['name'], 16),
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                });

                await testnet.execute(composer);

                primes[i]['populated'] = true;

                config['gen2']['inputs']['primes'] = primes;
                fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

                console.log('populate main application ' + i);
            }
        }
    } catch (error) {
        console.log(error);
    }
}