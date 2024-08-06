require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../../chain/mainnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.guardians.manager.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['launchpad']['guardians']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let items = config['launchpad']['guardians']['inputs']['items'];

        if (!items[i]['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/app/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/mainnet/launchpad/guardians/item/app/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                    from: sender,
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await mainnet.compile(approvalProgram),
                    clearProgram: await mainnet.compile(clearProgram),
                    numLocalInts: 0,
                    numLocalByteSlices: 0,
                    numGlobalInts: 0,
                    numGlobalByteSlices: 1,
                    extraPages: 0,
                    note: helpers.bytes('ID:' + items[i]['id']),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await mainnet.execute(composer);
            let application_id = response.information['application-index'];

            items[i]['application_id'] = application_id;
            items[i]['application_address'] = connection.baseClient.getApplicationAddress(application_id);
            items[i]['application_version'] = 0;

            config['launchpad']['guardians']['inputs']['items'] = items;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('create main application ' + i);
        }
    }

}