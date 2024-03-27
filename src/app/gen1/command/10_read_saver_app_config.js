require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let config = {
            name: null,
            starting_prime_id: null,
            ending_prime_id: null,
            main_app_id: null,
        };

        let info = await connection.indexerClient.lookupApplications(setup['saver_app']['id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'Config':
                    config.name = value.subarray(0, 16).toString('utf-8').trim();
                    config.starting_prime_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    config.ending_prime_id = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    config.main_app_id = connection.baseClient.decodeUint64(value.subarray(32, 40));
                    break;
            }
        }

        setup['saver_app']['config'] = config;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read saver app config');

    } catch (error) {
        console.log(error);
    }
}
