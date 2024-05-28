require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/vault/contract.json')));

        let vault = setup['gen1']['contracts']['vault'];

        if (!vault['optin']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: vault['application_id'],
                method: chain.method(contract, 'optin'),
                methodArgs: [
                    Number(process.env.VAULT_ASSET_ID),
                    setup['gen1']['contracts']['storage']['application_id'],
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
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: setup['gen1']['contracts']['storage']['application_address'],
                    amount: 100000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.addTransaction({
                sender: sender,
                signer: signer,
                txn: connection.baseClient.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: setup['gen1']['contracts']['storage']['application_address'],
                    assetIndex: Number(process.env.VAULT_ASSET_ID),
                    amount: 300,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            vault['optin'] = true;

            setup['gen1']['contracts']['vault'] = vault;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('called optin method');
        }

    } catch (error) {
        console.log(error);
    }
}
