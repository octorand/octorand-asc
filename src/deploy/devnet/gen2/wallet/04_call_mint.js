require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen2.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen2);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/wallet/contract.json')));

        let wallet = config['gen2']['contracts']['wallet'];
        let prime = config['gen2']['inputs']['prime'];

        if (!wallet['minted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: wallet['application_id'],
                method: helpers.method(contract, 'mint'),
                methodArgs: [
                    100,
                    config['gen2']['contracts']['storage']['application_id'],
                ],
                appForeignAssets: [
                    prime['prime_asset_id'],
                    config['setup']['platform']['asset_id']
                ],
                suggestedParams: {
                    ...params,
                    fee: 3000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            wallet['minted'] = true;

            config['gen2']['contracts']['wallet'] = wallet;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called mint method');
        }

    } catch (error) {
        console.log(error);
    }
}
