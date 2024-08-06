require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../../chain/mainnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/launchpad/guardians/item/app/contract.json')));

    let version = 1;

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['guardians']['inputs']['items'];

        let composer = new connection.baseClient.AtomicTransactionComposer();

        if (!items[i]['funded']) {
            items[i]['funded'] = true;

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: items[i]['application_address'],
                    amount: 300000,
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
                    config['setup']['guardians']['asset_id'],
                    items[i]['asset_id'],
                    helpers.bytes(items[i]['name'], 16),
                    items[i]['owner'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });
        }

        if (items[i]['application_version'] < version) {
            items[i]['application_version'] = version;

            let approvalProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/app/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/app/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: items[i]['application_id'],
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

            config['launchpad']['guardians']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('update main application ' + i);
        }
    }
}