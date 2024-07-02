require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/gen2/prime/build/contract.json')));

    let version = 1;

    let max = config['gen2']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen2']['inputs']['primes'];

        let composer = new connection.baseClient.AtomicTransactionComposer();

        if (!primes[i]['funded']) {
            primes[i]['funded'] = true;

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: primes[i]['application_address'],
                    amount: 400000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });
        }

        if (!primes[i]['initialized']) {
            primes[i]['initialized'] = true;

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: primes[i]['application_id'],
                method: helpers.method(contract, 'initialize'),
                methodArgs: [
                    primes[i]['id'],
                    config['setup']['platform']['asset_id'],
                    primes[i]['prime_asset_id'],
                    primes[i]['legacy_asset_id'],
                    primes[i]['parent_application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 4000,
                    flatFee: true
                }
            });
        }

        if (!primes[i]['populated']) {
            primes[i]['populated'] = true;

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
                    primes[i]['owner'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });
        }

        if (!primes[i]['loaded']) {
            primes[i]['loaded'] = true;

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
        }

        if (primes[i]['application_version'] < version) {
            primes[i]['application_version'] = version;

            let approvalProgram = fs.readFileSync('src/build/mainnet/gen2/prime/app/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/mainnet/gen2/prime/app/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: primes[i]['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await mainnet.compile(approvalProgram),
                    clearProgram: await mainnet.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });
        }

        if (composer.count() > 0) {
            await mainnet.execute(composer);

            config['gen2']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('fund main application ' + i);
            console.log('initialize main application ' + i);
            console.log('populate main application ' + i);
            console.log('load main application ' + i);
            console.log('update main application ' + i);
        }
    }
}