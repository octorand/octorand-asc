require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = [];

        let info = await connection.indexerClient.lookupApplications(setup['saver_app']['id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            for (let i = setup['saver_app']['config']['starting_prime_id']; i < setup['saver_app']['config']['ending_prime_id']; i++) {
                let index = chain.reference('Prime', i);
                console.log(key, index);

                if (key == index) {
                    let prime = {
                        id: null,
                        asset_id: null
                    };

                    prime.id = connection.baseClient.decodeUint64(value.subarray(0, 4));
                    prime.asset_id = connection.baseClient.decodeUint64(value.subarray(4, 12));

                    primes.push(prime);
                }
            }
        }

        setup['saver_app']['primes'] = primes;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read saver app primes');

    } catch (error) {
        console.log(error);
    }
}
