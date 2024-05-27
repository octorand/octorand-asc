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
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/build/gen1/vault/contract.json')));

        let vault = setup['gen1']['contracts']['vault'];
        let prime = setup['gen1']['inputs']['prime'];

        if (!vault['optout']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: vault['application_id'],
                method: chain.method(contract, 'optout'),
                methodArgs: [
                    Number(process.env.VAULT_ASSET_ID),
                    setup['gen1']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            vault['optout'] = true;

            setup['gen1']['contracts']['vault'] = vault;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

            console.log('called optout method');
        }

    } catch (error) {
        console.log(error);
    }
}
