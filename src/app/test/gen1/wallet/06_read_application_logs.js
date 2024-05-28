require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));

        let wallet = setup['gen1']['contracts']['wallet'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(wallet['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        wallet['logs'] = logs;

        setup['gen1']['contracts']['wallet'] = wallet;
        fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

    } catch (error) {
        console.log(error);
    }
}
