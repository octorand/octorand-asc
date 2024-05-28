require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let config = JSON.parse(fs.readFileSync('src/app/test/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/wallet/contract.json')));

        let wallet = config['gen1']['contracts']['wallet'];
        let prime = config['gen1']['inputs']['prime'];

        if (!wallet['upgraded']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: wallet['application_id'],
                method: chain.method(contract, 'upgrade'),
                methodArgs: [
                    config['gen1']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id']
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
                    to: config['gen1']['contracts']['storage']['application_address'],
                    assetIndex: prime['legacy_asset_id'],
                    amount: 1,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            wallet['upgraded'] = true;

            config['gen1']['contracts']['wallet'] = wallet;
            fs.writeFileSync('src/app/test/config.json', JSON.stringify(config, null, 4));

            console.log('called upgrade method');
        }

    } catch (error) {
        console.log(error);
    }
}
