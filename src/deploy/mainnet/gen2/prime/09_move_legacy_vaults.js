require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let vaults = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen2/prime/vaults.json'));

    let legacyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/legacy/contract.json')));
    let optinContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/optin/contract.json')));

    let optinApplication = config['gen2']['contracts']['prime']['optin'];

    let max = config['gen2']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen2']['inputs']['primes'];

        if (!primes[i]['moved_vaults']) {

            let profile = vaults['vaults'].find(x => x.id == primes[i].id);
            if (profile) {
                let assets = profile['assets'];
                if (assets.length > 0) {
                    for (let j = 0; j < assets.length; j++) {
                        let asset = assets[j];
                        console.log(asset);

                        let params = await connection.algodClient.getTransactionParams().do();
                        let composer = new connection.baseClient.AtomicTransactionComposer();

                        composer.addTransaction({
                            signer: signer,
                            txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                                from: sender,
                                to: sender,
                                assetIndex: asset.id,
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
                                asset.id,
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
                                to: primes[i]['application_address'],
                                amount: 100000,
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
                            appID: optinApplication['application_id'],
                            method: helpers.method(optinContract, 'optin'),
                            methodArgs: [
                                asset.id,
                                primes[i]['application_id'],
                            ],
                            appForeignAssets: [
                                config['setup']['platform']['asset_id']
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
                                assetIndex: asset.id,
                                amount: asset.amount,
                                suggestedParams: {
                                    ...params,
                                    fee: 1000,
                                    flatFee: true
                                }
                            })
                        });

                        await mainnet.execute(composer);

                        console.log('moved legacy asset ' + asset.id);
                    }
                }
            }

            primes[i]['moved_vaults'] = true;

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('moved legacy vault ' + i);
        }
    }
}