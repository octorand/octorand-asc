require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let info = await connection.indexerClient.lookupApplications(setup['main_application_id']).do();

        let data = {
            address: connection.baseClient.getApplicationAddress(Number(info['application']['id'])),
            creator: info['application']['params']['creator']
        };

        setup['main_application_address'] = data.address;
        setup['main_application_creator'] = data.creator;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main application');

    } catch (error) {
        console.log(error);
    }
}
