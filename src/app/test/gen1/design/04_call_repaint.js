require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/design/contract.json')));

        let design = setup['gen1']['contracts']['design'];
        let prime = setup['gen1']['inputs']['prime'];

        if (!design['repainted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: design['application_id'],
                method: chain.method(contract, 'repaint'),
                methodArgs: [
                    3,
                    4,
                    setup['gen1']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id']
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
                    to: connection.admin.addr,
                    assetIndex: Number(process.env.PLATFORM_ASSET_ID),
                    amount: 10000000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            design['repainted'] = true;

            setup['gen1']['contracts']['design'] = design;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

            console.log('called repaint method');
        }

    } catch (error) {
        console.log(error);
    }
}
