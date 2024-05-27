require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let design = setup['gen1']['contracts']['design'];

        let logs = [];

        let limit = 1000;
        let next = '';
        while (next !== undefined) {
            let response = await connection.indexerClient
                .lookupApplicationLogs(design['application_id'])
                .limit(limit)
                .nextToken(next)
                .do();

            next = response['next-token'];

            let data = response['log-data'];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    let log = data[i]['logs'][0];
                    let value = Buffer.from(log, 'base64');
                    logs.push(chain.event(value));
                }
            }
        }

        design['logs'] = logs;

        setup['gen1']['contracts']['design'] = design;
        fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

    } catch (error) {
        console.log(error);
    }
}
