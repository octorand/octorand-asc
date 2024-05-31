require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function (environment) {
    try {
        let connection = await chain.get(environment);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let vault = config['gen2']['contracts']['vault'];

        let logs = [];

        let pager = await chain.pager(connection.indexerClient.lookupApplicationLogs(vault['application_id']), 1000, 'log-data');
        for (let i = 0; i < pager.length; i++) {
            let log = pager[i]['logs'][0];
            let value = Buffer.from(log, 'base64');
            logs.push(chain.event(value));
        }

        vault['logs'] = logs;

        config['gen2']['contracts']['vault'] = vault;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
