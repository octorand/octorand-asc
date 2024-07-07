require('dotenv').config();

const algosdk = require("algosdk");

(async () => {
    try {

        let client = new algosdk.Algodv2('', process.env.TESTNET_ALGO_SERVER, '');
        let indexer = new algosdk.Indexer('', process.env.TESTNET_ALGO_INDEXER, '');

        let mnemonic = process.env.TESTNET_ADMIN_MNEMONIC;
        let user = algosdk.mnemonicToSecretKey(mnemonic);
        let sender = user.addr;

        let signer = algosdk.makeBasicAccountTransactionSigner(user);
        let params = await client.getTransactionParams().do();

        let account_assets_info = await indexer.lookupAccountAssets(sender).limit(10).do();
        let assets = account_assets_info.assets;

        for (let i = 0; i < assets.length; i++) {
            let asset_id = assets[i]['asset-id'];
            let amount = assets[i]['amount'];

            if (amount == 0) {
                let asset_info = await indexer.lookupAssetByID(asset_id).do();
                let receiver = asset_info['asset']['params']['creator'];

                let composer = new algosdk.AtomicTransactionComposer();

                composer.addTransaction({
                    signer: signer,
                    txn: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: sender,
                        to: sender,
                        assetIndex: asset_id,
                        amount: amount,
                        closeRemainderTo: receiver,
                        suggestedParams: {
                            ...params,
                            fee: 1000,
                            flatFee: true
                        }
                    })
                });

                composer.execute(client, 10)
                    .then(() => {
                        console.log(asset_id, amount, receiver);
                    })
                    .catch(() => {
                        console.log('FAILED');
                    });

                break;
            }
        }
    } catch (error) {
        console.log(error);
    }
})();