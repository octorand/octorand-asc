require('dotenv').config();

const algosdk = require("algosdk");

(async () => {
    try {
        let server = process.env.TESTNET_ALGO_SERVER;
        let mnemonic = process.env.TESTNET_ADMIN_MNEMONIC;
        let application = 0;

        let client = new algosdk.Algodv2('', server, '');
        let user = algosdk.mnemonicToSecretKey(mnemonic);
        let sender = user.addr;
        let signer = algosdk.makeBasicAccountTransactionSigner(user);
        let params = await client.getTransactionParams().do();

        let composer = new algosdk.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: algosdk.makeApplicationDeleteTxnFromObject({
                from: sender,
                appIndex: application,
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        await composer.execute(client, 10);
    } catch (error) {
        console.log(error);
    }
})();