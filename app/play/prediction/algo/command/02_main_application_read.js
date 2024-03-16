require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('app/play/prediction/algo/setup.json'));

        let info = await connection.indexerClient.lookupApplications(setup['main_app_id']).do();

        let data = {
            address: connection.baseClient.getApplicationAddress(Number(info['application']['id'])),
            creator: info['application']['params']['creator']
        };

        setup['main_app_address'] = data.address;
        setup['main_app_creator'] = data.creator;

        fs.writeFileSync('app/play/prediction/algo/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main application');

    } catch (error) {
        console.log(error);
    }
}
