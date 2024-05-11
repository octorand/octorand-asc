require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = setup['primes'];

        for (let i = 0; i < primes.length; i++) {
            let prime = primes[i];

            let config = {
                id: null,
                prime_asset_id: null,
                legacy_asset_id: null,
            };

            let info = await connection.indexerClient.lookupApplications(prime['application_id']).do();
            let global = info['application']['params']['global-state'];

            for (let i = 0; i < global.length; i++) {
                let params = global[i];
                let key = Buffer.from(params.key, 'base64').toString('utf-8');
                let value = Buffer.from(params.value['bytes'], 'base64');

                switch (key) {
                    case 'C1':
                        config.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                        config.prime_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                        config.legacy_asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                        break;
                    case 'C2':
                        break;
                }
            }

            prime['config'] = config;
            primes[i] = prime;

            setup['primes'] = primes;
            fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

            console.log('read prime application ' + i);
        }

        console.log('read prime applications');

    } catch (error) {
        console.log(error);
    }
}
