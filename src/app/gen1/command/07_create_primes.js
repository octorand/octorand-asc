require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.gen1.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let contract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/app/gen1/build/main/contract.json')));

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender,
                to: setup['main_app']['address'],
                amount: 500000,
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
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'create_prime'),
            methodArgs: [
                0,
                chain.bytes('TG1-000'),
                chain.bytes('Test Gen1 #000'),
                chain.bytes('template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}'),
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
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'create_prime'),
            methodArgs: [
                1,
                chain.bytes('TG1-001'),
                chain.bytes('Test Gen1 #001'),
                chain.bytes('template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}'),
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
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'create_prime'),
            methodArgs: [
                2,
                chain.bytes('TG1-002'),
                chain.bytes('Test Gen1 #002'),
                chain.bytes('template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}'),
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
