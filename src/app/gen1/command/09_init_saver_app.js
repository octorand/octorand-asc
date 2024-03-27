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

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/gen1/build/saver/contract.json')));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['saver_app']['id']),
            method: chain.method(contract, 'init'),
            methodArgs: [
                0,
                50,
                Number(setup['main_app']['id'])
            ],
            suggestedParams: {
                ...params,
                fee: 1000,
                flatFee: true
            }
        });

        await chain.execute(composer);

        console.log('initiated saver app');

    } catch (error) {
        console.log(error);
    }
}
