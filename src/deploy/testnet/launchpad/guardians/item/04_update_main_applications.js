require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
    let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/gen1/item/build/contract.json')));

    let version = 1;

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['gen1']['inputs']['items'];

        let composer = new connection.baseClient.AtomicTransactionComposer();

        if (!items[i]['funded']) {
            items[i]['funded'] = true;

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: items[i]['application_address'],
                    amount: 400000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });
        }

        if (!items[i]['initialized']) {
            items[i]['initialized'] = true;

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: items[i]['application_id'],
                method: helpers.method(contract, 'initialize'),
                methodArgs: [
                    items[i]['id'],
                    config['setup']['platform']['asset_id'],
                    items[i]['item_asset_id'],
                    items[i]['legacy_asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 4000,
                    flatFee: true
                }
            });
        }

        if (!items[i]['populated']) {
            items[i]['populated'] = true;

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: items[i]['application_id'],
                method: helpers.method(contract, 'populate'),
                methodArgs: [
                    items[i]['theme'],
                    items[i]['skin'],
                    items[i]['is_founder'],
                    items[i]['is_artifact'],
                    items[i]['is_pioneer'],
                    items[i]['is_explorer'],
                    items[i]['score'],
                    items[i]['sales'],
                    items[i]['drains'],
                    items[i]['transforms'],
                    helpers.bytes(items[i]['name'], 8),
                    items[i]['owner'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });
        }

        if (!items[i]['loaded']) {
            items[i]['loaded'] = true;

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: items[i]['application_address'],
                    assetIndex: config['setup']['platform']['asset_id'],
                    amount: items[i]['rewards'],
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
                    to: items[i]['application_address'],
                    amount: 100000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });
        }

        if (items[i]['application_version'] < version) {
            items[i]['application_version'] = version;

            let approvalProgram = fs.readFileSync('src/build/testnet/gen1/item/app/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/testnet/gen1/item/app/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: items[i]['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await testnet.compile(approvalProgram),
                    clearProgram: await testnet.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });
        }

        if (composer.count() > 0) {
            await testnet.execute(composer);

            config['gen1']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('fund main application ' + i);
            console.log('initialize main application ' + i);
            console.log('populate main application ' + i);
            console.log('load main application ' + i);
            console.log('update main application ' + i);
        }
    }

}