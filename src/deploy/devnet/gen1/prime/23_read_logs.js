require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');
const events = require('./../../../../chain/util/events');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let core = config['gen1']['contracts']['prime']['core'];
        if (core['application_id']) {
            let logs = [];
            let pager = await helpers.pager(connection.indexerClient.lookupApplicationLogs(core['application_id']), 1000, 'log-data');
            for (let i = 0; i < pager.length; i++) {
                let log = pager[i]['logs'][0];
                let value = Buffer.from(log, 'base64');
                logs.push(events.event(value));
            }

            core['logs'] = logs;

            config['gen1']['contracts']['prime']['core'] = core;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));
        }

        let options = ['buy', 'list', 'mint', 'optin', 'optout', 'rename', 'repaint', 'unlist', 'upgrade', 'withdraw'];

        for (let i = 0; i < options.length; i++) {
            let option = options[i];

            let contract = config['gen1']['contracts']['prime'][option];
            if (contract['application_id']) {
                let logs = [];
                let pager = await helpers.pager(connection.indexerClient.lookupApplicationLogs(contract['application_id']), 1000, 'log-data');
                for (let i = 0; i < pager.length; i++) {
                    let log = pager[i]['logs'][0];
                    let value = Buffer.from(log, 'base64');
                    logs.push(events.event(value));
                }

                contract['logs'] = logs;

                config['gen1']['contracts']['prime'][option] = contract;
                fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));
            }
        }

    } catch (error) {
        console.log(error);
    }
}
