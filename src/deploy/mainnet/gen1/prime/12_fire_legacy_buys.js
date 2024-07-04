require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let events = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/events.json'));

    let buyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen1/prime/buy/contract.json')));

    let buyApplication = config['gen1']['contracts']['prime']['buy'];

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        if (!primes[i]['fired_buys']) {

            let profile = events['primes'].find(x => x.id == primes[i].id);
            if (profile) {
                let buys = profile['buys'];
                if (buys.length > 0) {
                    let params = await connection.algodClient.getTransactionParams().do();
                    let composer = new connection.baseClient.AtomicTransactionComposer();

                    for (let j = 0; j < buys.length; j++) {
                        composer.addMethodCall({
                            sender: sender,
                            signer: signer,
                            appID: buyApplication['application_id'],
                            method: helpers.method(buyContract, 'fire'),
                            methodArgs: [
                                buys[j].timestamp,
                                buys[j].sender,
                                buys[j].seller,
                                buys[j].price,
                                primes[i]['application_id'],
                            ],
                            suggestedParams: {
                                ...params,
                                fee: 2000,
                                flatFee: true
                            }
                        });
                    }

                    await mainnet.execute(composer);

                    primes[i]['fired_buys'] = true;

                    config['gen1']['inputs']['primes'] = primes;
                    fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

                    console.log('fired_legacy buys ' + i);
                }
            }
        }
    }
}