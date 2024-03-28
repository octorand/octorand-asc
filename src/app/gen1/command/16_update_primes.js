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

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'update_prime'),
            methodArgs: [
                0,
                1000000,
                100,
                200,
                300,
                400,
                10,
                1,
                chain.bytes('ABCDEFGH'),
                chain.bytes('Prime #000', 32),
                Number(setup['saver_app']['id'])
            ],
            boxes: [
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Saver', 0)
                },
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Prime', 0)
                }
            ],
            suggestedParams: {
                ...params,
                fee: 1000,
                flatFee: true
            }
        });

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'update_prime'),
            methodArgs: [
                1,
                2000000,
                200,
                300,
                400,
                500,
                20,
                2,
                chain.bytes('IJKLMNOP'),
                chain.bytes('Prime #001', 32),
                Number(setup['saver_app']['id'])
            ],
            boxes: [
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Saver', 0)
                },
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Prime', 1)
                }
            ],
            suggestedParams: {
                ...params,
                fee: 1000,
                flatFee: true
            }
        });

        composer.addMethodCall({
            sender: sender,
            signer: signer,
            appID: Number(setup['main_app']['id']),
            method: chain.method(contract, 'update_prime'),
            methodArgs: [
                2,
                3000000,
                400,
                500,
                600,
                700,
                30,
                3,
                chain.bytes('QRSTUVWX'),
                chain.bytes('Prime #002', 32),
                Number(setup['saver_app']['id'])
            ],
            boxes: [
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Saver', 0)
                },
                {
                    appIndex: Number(setup['main_app']['id']),
                    name: chain.reference('Prime', 2)
                }
            ],
            suggestedParams: {
                ...params,
                fee: 1000,
                flatFee: true
            }
        });

        await chain.execute(composer);

        console.log('updated primes');

    } catch (error) {
        console.log(error);
    }
}
