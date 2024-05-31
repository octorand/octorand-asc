require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let storage = config['gen2']['contracts']['storage'];
        let prime = config['gen2']['inputs']['prime'];

        if (!storage['locked']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: storage['application_address'],
                    assetIndex: prime['prime_asset_id'],
                    amount: 1,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await testnet.execute(composer);

            storage['locked'] = true;

            config['gen2']['contracts']['storage'] = storage;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('locked prime asset');
        }

    } catch (error) {
        console.log(error);
    }
}
