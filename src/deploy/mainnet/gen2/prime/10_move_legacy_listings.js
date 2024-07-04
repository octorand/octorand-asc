require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let sales = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen2/prime/sales.json'));

    let legacyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/legacy/contract.json')));
    let listContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/list/contract.json')));
    let upgradeContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/upgrade/contract.json')));

    let listApplication = config['gen2']['contracts']['prime']['list'];
    let upgradeApplication = config['gen2']['contracts']['prime']['upgrade'];

    let max = config['gen2']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen2']['inputs']['primes'];

        if (!primes[i]['moved_listings']) {

            let profile = sales['sales'].find(x => x.id == primes[i].id);
            if (profile) {
                let seller = profile['seller'];
                let price = profile['price'];

                console.log(seller, price);

                let params = await connection.algodClient.getTransactionParams().do();
                let composer = new connection.baseClient.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: sender,
                        assetIndex: primes[i]['legacy_asset_id'],
                        total: 0,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                composer.addTransaction({
                    signer: signer,
                    txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: sender,
                        assetIndex: primes[i]['prime_asset_id'],
                        total: 0,
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
                    appID: primes[i]['legacy_application_id'],
                    method: helpers.method(legacyContract, 'optout'),
                    methodArgs: [
                        primes[i]['legacy_asset_id'],
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
                    appID: upgradeApplication['application_id'],
                    method: helpers.method(upgradeContract, 'upgrade'),
                    methodArgs: [
                        primes[i]['application_id'],
                    ],
                    appForeignAssets: [
                        primes[i]['prime_asset_id']
                    ],
                    suggestedParams: {
                        ...params,
                        fee: 3000,
                        flatFee: true
                    }
                });

                composer.addTransaction({
                    sender: sender,
                    signer: signer,
                    txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: primes[i]['application_address'],
                        assetIndex: primes[i]['legacy_asset_id'],
                        amount: 1,
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
                    appID: listApplication['application_id'],
                    method: helpers.method(listContract, 'move'),
                    methodArgs: [
                        price,
                        seller,
                        primes[i]['application_id'],
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
            }

            primes[i]['moved_listings'] = true;

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('moved legacy listing ' + i);
        }
    }
}