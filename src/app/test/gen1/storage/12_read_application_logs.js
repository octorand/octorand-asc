require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));

        let storage = setup['gen1']['contracts']['storage'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(storage['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        storage['logs'] = logs;

        setup['gen1']['contracts']['storage'] = storage;
        fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

    } catch (error) {
        console.log(error);
    }
}
