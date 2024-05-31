require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function (environment) {
    try {
        let connection = await chain.get(environment);
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/gen2/wallet/contract.json')));

        let wallet = config['gen2']['contracts']['wallet'];
        let prime = config['gen2']['inputs']['prime'];

        if (!wallet['minted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: wallet['application_id'],
                method: chain.method(contract, 'mint'),
                methodArgs: [
                    100,
                    config['gen2']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                    Number(process.env.PLATFORM_ASSET_ID)
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await chain.execute(composer);

            wallet['minted'] = true;

            config['gen2']['contracts']['wallet'] = wallet;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called mint method');
        }

    } catch (error) {
        console.log(error);
    }
}
