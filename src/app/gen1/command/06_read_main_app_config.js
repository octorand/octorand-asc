require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let config = {
            primes_count: null,
            platform_asset_id: null,
            platform_asset_reserve: null,
        };

        let info = await connection.indexerClient.lookupApplications(setup['main_app']['id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'Config':
                    config.primes_count = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    config.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    config.platform_asset_reserve = connection.baseClient.encodeAddress(value.subarray(32, 64));
                    break;
            }
        }

        setup['main_app']['config'] = config;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main app config');

    } catch (error) {
        console.log(error);
    }
}
