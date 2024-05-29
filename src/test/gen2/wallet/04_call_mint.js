require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));
        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/gen1/wallet/contract.json')));

        let wallet = config['gen1']['contracts']['wallet'];
        let prime = config['gen1']['inputs']['prime'];

        if (!wallet['minted']) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: wallet['application_id'],
                method: chain.method(contract, 'mint'),
                methodArgs: [
                    100,
                    config['gen1']['contracts']['storage']['application_id'],
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

            config['gen1']['contracts']['wallet'] = wallet;
            fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

            console.log('called mint method');
        }

    } catch (error) {
        console.log(error);
    }
}
