require('dotenv').config();

const chain = require('./../chain/index');

(async () => {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

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

    } catch (error) {
        console.log(error);
    }
})();