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

        let state = {
            primes_count: null,
            platform_asset_id: null,
            platform_asset_reserve: null,
        };

        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let state = global[i];
            let key = Buffer.from(state.key, 'base64').toString('utf-8');
            let value = Buffer.from(state.value['bytes'], 'base64');

            switch (key) {
                case '1':
                    data.primes_count = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    data.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    data.platform_asset_reserve = connection.baseClient.encodeAddress(value.subarray(16, 48));
                    break;
            }
        }

        setup['state'] = state;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main application');

    } catch (error) {
        console.log(error);
    }
}
