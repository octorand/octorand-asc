require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let config = JSON.parse(fs.readFileSync('src/app/test/config.json'));

        let market = config['gen1']['contracts']['market'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(market['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        market['logs'] = logs;

        config['gen1']['contracts']['market'] = market;
        fs.writeFileSync('src/app/test/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
