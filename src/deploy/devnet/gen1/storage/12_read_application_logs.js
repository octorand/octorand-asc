require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));

        let storage = config['gen1']['contracts']['storage'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(storage['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        storage['logs'] = logs;

        config['gen1']['contracts']['storage'] = storage;
        fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
