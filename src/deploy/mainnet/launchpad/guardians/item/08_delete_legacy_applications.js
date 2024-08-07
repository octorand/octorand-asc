require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();
    let sender = connection.admin.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['guardians']['inputs']['items'];

        if (!items[i]['legacy_application_deleted']) {
            let params = await connection.algodClient.getTransactionParams().do();
            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationDeleteTxnFromObject({
                    from: sender,
                    appIndex: items[i]['legacy_application_id'],
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await mainnet.execute(composer);

            items[i]['legacy_application_deleted'] = true;

            config['launchpad']['guardians']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('deleted legacy application ' + i);
        }
    }
}