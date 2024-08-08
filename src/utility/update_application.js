require('dotenv').config();

const algosdk = require("algosdk");
const fs = require('fs');
const mainnet = require('./../chain/mainnet');

(async () => {
    try {
        let server = process.env.TESTNET_ALGO_SERVER;
        let mnemonic = process.env.TESTNET_ADMIN_MNEMONIC;
        let application = 0;
        let approval = 'src/build/xxx/approval.teal';
        let clear = 'src/build/xxx/clear.teal';

        let client = new algosdk.Algodv2('', server, '');
        let user = algosdk.mnemonicToSecretKey(mnemonic);
        let sender = user.addr;
        let signer = algosdk.makeBasicAccountTransactionSigner(user);
        let params = await client.getTransactionParams().do();

        let composer = new algosdk.AtomicTransactionComposer();

        let approvalProgram = fs.readFileSync(approval, 'utf8');
        let clearProgram = fs.readFileSync(clear, 'utf8');

        composer.addTransaction({
            signer: signer,
            txn: algosdk.makeApplicationUpdateTxnFromObject({
                from: sender,
                appIndex: application,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram: await mainnet.compile(approvalProgram),
                clearProgram: await mainnet.compile(clearProgram),
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