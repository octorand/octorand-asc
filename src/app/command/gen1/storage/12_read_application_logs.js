require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let storage = setup['gen1']['contracts']['storage'];

        let logs = [];

        let limit = 1000;
        let nextToken = '';
        while (nextToken !== undefined) {
            let response = await connection.indexerClient
                .lookupApplicationLogs(storage['application_id'])
                .limit(limit)
                .nextToken(nextToken)
                .do();

            nextToken = response['next-token'];

            let data = response['log-data'];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    let log = data[i]['logs'][0];
                    let value = Buffer.from(log, 'base64');
                    logs.push(chain.event(value));
                }
            }
        }

        storage['logs'] = logs;

        setup['gen1']['contracts']['storage'] = storage;
        fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

    } catch (error) {
        console.log(error);
    }
}
