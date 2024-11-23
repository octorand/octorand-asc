require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');
const helpers = require('./../../../chain/util/helpers');
const events = require('./../../../chain/util/events');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let contracts = ['auth', 'deposit'];

        for (let i = 0; i < contracts.length; i++) {
            let contract = contracts[i];

            let application = config['game']['contracts'][contract];

            if (application['application_id']) {
                let logs = [];
                let pager = await helpers.pager(connection.indexerClient.lookupApplicationLogs(application['application_id']), 1000, 'log-data');
                for (let i = 0; i < pager.length; i++) {
                    let log = pager[i]['logs'][0];
                    let value = Buffer.from(log, 'base64');
                    logs.push(events.event(value));
                }

                application['logs'] = logs;

                config['game']['contracts'][contract] = application;
                fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));
            }
        }
    } catch (error) {
        console.log(error);
    }
}
