require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../chain/testnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await testnet.get();
    let params = await connection.algodClient.getTransactionParams().do();
    let sender = connection.gen1.addr;
    let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.gen1);

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        if (!primes[i]['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/testnet/gen1/prime/build/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/testnet/gen1/prime/build/clear.teal', 'utf8');

            let composer = new connection.baseClient.AtomicTransactionComposer();

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationCreateTxnFromObject({
                    from: sender,
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await testnet.compile(approvalProgram),
                    clearProgram: await testnet.compile(clearProgram),
                    numLocalInts: 0,
                    numLocalByteSlices: 0,
                    numGlobalInts: 0,
                    numGlobalByteSlices: 2,
                    extraPages: 0,
                    note: helpers.bytes('ID:' + primes[i]['id']),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            let response = await testnet.execute(composer);
            let application_id = response.information['application-index'];

            primes[i]['application_id'] = application_id;
            primes[i]['application_address'] = connection.baseClient.getApplicationAddress(application_id);
            primes[i]['application_version'] = 0;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

            console.log('create main application ' + i);
        }
    }

}