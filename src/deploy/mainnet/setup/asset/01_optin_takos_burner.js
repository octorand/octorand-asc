require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await mainnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

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

        let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

        let opted = config['setup']['takos']['optin_burner'];

        if (!opted) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: process.env.MAINNET_BURNER_APPLICATION_ADDRESS,
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
                appID: Number(process.env.MAINNET_BURNER_APPLICATION_ID),
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

            await mainnet.execute(composer);

            config['setup']['takos']['optin_burner'] = true;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in takos burner');
        }
    } catch (error) {
        console.log(error);
    }
}