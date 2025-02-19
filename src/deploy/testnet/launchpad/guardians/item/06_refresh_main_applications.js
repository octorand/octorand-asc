require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.guardians.manager.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
    let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/testnet/launchpad/guardians/item/app/contract.json')));

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['guardians']['inputs']['items'];

        if (!items[i]['refreshed']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: items[i]['application_id'],
                method: helpers.method(contract, 'refresh'),
                methodArgs: [],
                appForeignAssets: [
                    config['setup']['guardians']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            items[i]['refreshed'] = true;

            config['launchpad']['guardians']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('refresh main application ' + i);
        }
    }

}