require('dotenv').config();

const algosdk = require("algosdk");

(async () => {
    try {

        let client = new algosdk.Algodv2('', process.env.TESTNET_ALGO_SERVER, '');

        let mnemonic = process.env.TESTNET_ADMIN_MNEMONIC;
        let user = algosdk.mnemonicToSecretKey(mnemonic);
        let sender = user.addr;

        let signer = algosdk.makeBasicAccountTransactionSigner(user);
        let params = await client.getTransactionParams().do();

        let assets = [];

        for (let i = 0; i < assets.length; i++) {
            let asset_id = assets[i];

            let composer = new algosdk.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: sender,
                    assetIndex: asset_id,
                    amount: 0,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.execute(client, 10)
                .then(() => {
                    console.log(asset_id);
                })
                .catch(() => {
                    console.log('FAILED');
                });
        }
    } catch (error) {
        console.log(error);
    }
})();