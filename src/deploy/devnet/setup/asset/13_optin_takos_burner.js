require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.takos.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.takos.manager);

        let contract = new connection.baseClient.ABIContract({
            "name": "ARC54",
            "desc": "Standardized application for burning ASAs",
            "methods": [
                {
                    "name": "arc54_optIntoASA",
                    "args": [
                        {
                            "name": "asa",
                            "type": "asset",
                            "desc": "The asset to which the contract will opt in"
                        }
                    ],
                    "desc": "A method to opt the contract into an ASA",
                    "returns": {
                        "type": "void",
                        "desc": ""
                    }
                },
                {
                    "name": "createApplication",
                    "desc": "",
                    "returns": {
                        "type": "void",
                        "desc": ""
                    },
                    "args": []
                }
            ]
        });

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let opted = config['setup']['optin_takos_burner'];

        if (!opted) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: process.env.DEVNET_BURNER_APPLICATION_ADDRESS,
                    amount: 200000,
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: Number(process.env.DEVNET_BURNER_APPLICATION_ID),
                method: helpers.method(contract, 'arc54_optIntoASA'),
                methodArgs: [
                    Number(config['setup']['takos']['asset_id']),
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            config['setup']['optin_takos_burner'] = true;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in takos burner');
        }
    } catch (error) {
        console.log(error);
    }
}