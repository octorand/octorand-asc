require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let wallet = setup['gen1']['contracts']['wallet'];

        let logs = [];

        let limit = 1000;
        let nextToken = '';
        while (nextToken !== undefined) {
            let response = await connection.indexerClient
                .lookupApplicationLogs(wallet['application_id'])
                .limit(limit)
                .nextToken(nextToken)
                .do();

            nextToken = response['next-token'];

            let data = response['log-data'];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    logs.push(data[i]['logs']);
                }
            }
        }

        wallet['logs'] = logs;

        setup['gen1']['contracts']['wallet'] = wallet;
        fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

    } catch (error) {
        console.log(error);
    }
}
