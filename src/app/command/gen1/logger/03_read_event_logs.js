require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let logger = setup['gen1']['logger'];

        let info = await connection.indexerClient.lookupApplicationLogs(logger['application_id']).do();
        let logs = info['log-data'];

        if (logs) {
            for (let i = 0; i < logs.length; i++) {
                console.log(logs[i].logs);
            }
        }

        console.log('read event logs');

    } catch (error) {
        console.log(error);
    }
}
