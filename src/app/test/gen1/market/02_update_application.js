require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let market = setup['gen1']['contracts']['market'];

        let version = 1;

        if (market['application_version'] < version) {

            let composer = new connection.baseClient.AtomicTransactionComposer();

            let approvalProgram = fs.readFileSync('src/app/build/gen1/market/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/app/build/gen1/market/clear.teal', 'utf8');

            composer.addTransaction({
                signer: signer,
                txn: connection.baseClient.makeApplicationUpdateTxnFromObject({
                    from: sender,
                    appIndex: market['application_id'],
                    onComplete: connection.baseClient.OnApplicationComplete.NoOpOC,
                    approvalProgram: await chain.compile(approvalProgram),
                    clearProgram: await chain.compile(clearProgram),
                    suggestedParams: {
                        ...params,
                        fee: 1000,
                        flatFee: true
                    }
                })
            });

            await chain.execute(composer);

            market['application_version'] = version;

            setup['gen1']['contracts']['market'] = market;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

            console.log('updated market application');
        }

    } catch (error) {
        console.log(error);
    }
}
