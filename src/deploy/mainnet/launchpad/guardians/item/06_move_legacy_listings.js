require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let sales = JSON.parse(fs.readFileSync('src/deploy/mainnet/launchpad/guardians/item/sales.json'));

    let legacyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/launchpad/guardians/item/legacy/contract.json')));
    let listContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/mainnet/launchpad/guardians/item/list/contract.json')));

    let listApplication = config['launchpad']['guardians']['contracts']['item']['list'];

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['guardians']['inputs']['items'];

        if (!items[i]['moved_listings']) {

            let profile = sales['sales'].find(x => x.id == items[i].id);
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
                        assetIndex: items[i]['item_asset_id'],
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
                    appID: items[i]['legacy_application_id'],
                    method: helpers.method(legacyContract, 'optout'),
                    methodArgs: [
                        items[i]['item_asset_id'],
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
                    appID: listApplication['application_id'],
                    method: helpers.method(listContract, 'move'),
                    methodArgs: [
                        price,
                        seller,
                        items[i]['application_id'],
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
                        to: items[i]['application_address'],
                        assetIndex: items[i]['item_asset_id'],
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

            items[i]['moved_listings'] = true;

            config['launchpad']['guardians']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('moved legacy listing ' + i);
        }
    }
}