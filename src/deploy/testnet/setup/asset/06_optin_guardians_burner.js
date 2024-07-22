require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await testnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.guardians.manager.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.guardians.manager);

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

        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let opted = config['setup']['optin_guardians_burner'];

        if (!opted) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                    from: sender,
                    to: process.env.TESTNET_BURNER_APPLICATION_ADDRESS,
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
                appID: Number(process.env.TESTNET_BURNER_APPLICATION_ID),
                method: helpers.method(contract, 'arc54_optIntoASA'),
                methodArgs: [
                    Number(config['setup']['guardians']['asset_id']),
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await testnet.execute(composer);

            config['setup']['optin_guardians_burner'] = true;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('opted in guardians burner');
        }
    } catch (error) {
        console.log(error);
    }
}