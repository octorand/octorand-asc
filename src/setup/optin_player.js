require('dotenv').config();

const chain = require('./../lib/chain');

(async () => {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

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

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: sender,
                to: sender,
                assetIndex: Number(process.env.VAULT_ASSET_ID),
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