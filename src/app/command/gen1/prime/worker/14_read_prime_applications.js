require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/setup.json'));

        let primes = setup['gen1']['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            let config = {
                id: null,
                prime_asset_id: null,
                legacy_asset_id: null,
                parent_application_id: null,
                theme: null,
                skin: null,
                is_founder: null,
                is_artifact: null,
                is_pioneer: null,
                is_explorer: null,
                score: null,
                sales: null,
                mints: null,
                renames: null,
                repaints: null,
                price: null,
                seller: null,
                name: null,
                description: null,
            };

            let info = await connection.indexerClient.lookupApplications(prime['application_id']).do();
            let global = info['application']['params']['global-state'];

            for (let i = 0; i < global.length; i++) {
                let params = global[i];
                let key = Buffer.from(params.key, 'base64').toString('utf-8');
                let value = Buffer.from(params.value['bytes'], 'base64');

                switch (key) {
                    case 'Config1':
                        config.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                        config.prime_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                        config.legacy_asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                        config.parent_application_id = connection.baseClient.decodeUint64(value.subarray(24, 32));
                        config.theme = connection.baseClient.decodeUint64(value.subarray(32, 34));
                        config.skin = connection.baseClient.decodeUint64(value.subarray(34, 36));
                        config.is_founder = connection.baseClient.decodeUint64(value.subarray(36, 37));
                        config.is_artifact = connection.baseClient.decodeUint64(value.subarray(37, 38));
                        config.is_pioneer = connection.baseClient.decodeUint64(value.subarray(38, 39));
                        config.is_explorer = connection.baseClient.decodeUint64(value.subarray(39, 40));
                        config.score = connection.baseClient.decodeUint64(value.subarray(40, 48));
                        config.sales = connection.baseClient.decodeUint64(value.subarray(48, 52));
                        config.mints = connection.baseClient.decodeUint64(value.subarray(52, 56));
                        config.renames = connection.baseClient.decodeUint64(value.subarray(56, 60));
                        config.repaints = connection.baseClient.decodeUint64(value.subarray(60, 64));
                        config.price = connection.baseClient.decodeUint64(value.subarray(64, 72));
                        config.seller = connection.baseClient.encodeAddress(value.subarray(72, 104));
                        config.name = value.subarray(104, 112).toString('utf-8').trim();
                        break;
                    case 'Config2':
                        config.description = value.subarray(0, 64).toString('utf-8').trim();
                        break;
                }
            }

            prime['config'] = config;
            primes[i] = prime;

            setup['gen1']['primes'] = primes;
            fs.writeFileSync('src/app/setup.json', JSON.stringify(setup, null, 4));

            console.log('read prime application ' + i);
        }

        console.log('read prime applications');

    } catch (error) {
        console.log(error);
    }
}
