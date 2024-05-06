require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/gen1/build/main/contract.json')));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        for (let i = 0; i < setup['main_app']['primes'].length; i++) {
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: Number(setup['main_app']['id']),
                method: chain.method(contract, 'update_prime_application'),
                methodArgs: [
                    Number(setup['main_app']['primes'][i]['application_id'])
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });
        }

        await chain.execute(composer);

        console.log('updated prime applications');

    } catch (error) {
        console.log(error);
    }
}
