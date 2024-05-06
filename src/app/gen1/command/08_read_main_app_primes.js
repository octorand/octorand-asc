require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = [];

        let info = await connection.indexerClient.lookupAccountCreatedApplications(setup['main_app']['address']).do();

        for (let i = 0; i < info['applications'].length; i++) {
            let prime = {
                id: null,
                asset_id: null,
                application_id: info['applications'][i]['id'],
            };

            let global = info['applications'][i]['params']['global-state'];

            for (let i = 0; i < global.length; i++) {
                let params = global[i];
                let key = Buffer.from(params.key, 'base64').toString('utf-8');
                let value = Buffer.from(params.value['bytes'], 'base64');

                switch (key) {
                    case 'C-1':
                        prime.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                        prime.asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                        break;
                }
            }

            primes.push(prime);
        }

        setup['main_app']['primes'] = primes;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main app primes');

    } catch (error) {
        console.log(error);
    }
}
