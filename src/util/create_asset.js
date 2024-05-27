require('dotenv').config();

const chain = require('./../chain/index');

(async () => {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: sender,
                total: 1000000000000,
                decimals: 6,
                defaultFrozen: false,
                manager: sender,
                reserve: sender,
                unitName: "TEST",
                assetName: "Test",
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        let response = await chain.execute(composer);

        let assetId = response.information['asset-index'];
        console.log(assetId);

    } catch (error) {
        console.log(error);
    }
})();