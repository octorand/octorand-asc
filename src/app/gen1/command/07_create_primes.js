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

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender,
                to: setup['main_application_address'],
                amount: 300000,
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
            appID: Number(setup['main_application_id']),
            method: chain.method(contract, 'create_prime'),
            methodArgs: [
                0,
                chain.bytes('TG1-000'),
                chain.bytes('Test Gen1 #000'),
                chain.bytes('template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}')
            ],
            boxes: [
                {
                    appIndex: Number(setup['main_application_id']),
                    name: connection.baseClient.encodeUint64(0)
                }
            ],
            suggestedParams: {
                ...params,
                fee: 4000,
                flatFee: true
            }
        });

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['main_application_id']),
            method: chain.method(contract, 'create_prime'),
            methodArgs: [
                1,
                chain.bytes('TG1-001'),
                chain.bytes('Test Gen1 #001'),
                chain.bytes('template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}')
            ],
            boxes: [
                {
                    appIndex: Number(setup['main_application_id']),
                    name: connection.baseClient.encodeUint64(1)
                }
            ],
            suggestedParams: {
                ...params,
                fee: 4000,
                flatFee: true
            }
        });

        await chain.execute(composer);

        console.log('created primes');

    } catch (error) {
        console.log(error);
    }
}
