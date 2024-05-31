require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.devnet();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let design = config['gen1']['contracts']['design'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(design['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        design['logs'] = logs;

        config['gen1']['contracts']['design'] = design;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
