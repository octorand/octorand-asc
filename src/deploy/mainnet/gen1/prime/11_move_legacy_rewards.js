require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let legacyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen1/prime/legacy/contract.json')));
    let appContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen1/prime/app/contract.json')));

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        if (i != 900) {
            continue;
        }

        let primes = config['gen1']['inputs']['primes'];

        if (!primes[i]['moved_rewards']) {

            let params = await connection.algodClient.getTransactionParams().do();
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: primes[i]['legacy_application_id'],
                method: helpers.method(legacyContract, 'optout'),
                methodArgs: [
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: primes[i]['legacy_application_id'],
                method: helpers.method(legacyContract, 'withdraw'),
                methodArgs: [],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: primes[i]['application_address'],
                    assetIndex: config['setup']['platform']['asset_id'],
                    amount: primes[i]['rewards'],
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
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: primes[i]['application_address'],
                    amount: primes[i]['royalties'],
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: primes[i]['application_id'],
                method: helpers.method(appContract, 'refresh'),
                methodArgs: [],
                appForeignAssets: [
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await mainnet.execute(composer);

            primes[i]['moved_rewards'] = true;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('moved legacy rewards ' + i);
        }
    }
}