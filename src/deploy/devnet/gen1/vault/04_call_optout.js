require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.player.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.player);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen1/vault/contract.json')));

        let vault = config['gen1']['contracts']['vault'];
        let prime = config['gen1']['inputs']['prime'];

        if (!vault['optout']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: vault['application_id'],
                method: chain.method(contract, 'optout'),
                methodArgs: [
                    Number(process.env.VAULT_ASSET_ID),
                    config['gen1']['contracts']['storage']['application_id'],
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

            config['gen1']['contracts']['vault'] = vault;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called optout method');
        }

    } catch (error) {
        console.log(error);
    }
}
