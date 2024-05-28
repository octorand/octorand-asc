require('dotenv').config();

const chain = require('./../../chain/index');

exports.execute = async function () {
    try {

        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: sender,
                to: sender,
                assetIndex: Number(process.env.PLATFORM_ASSET_ID),
                total: 0,
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        await chain.execute(composer);

        console.log('opted in gen1');

    } catch (error) {
        console.log(error);
    }
}