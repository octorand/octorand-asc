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
            let key = Buffer.from(params.key, 'base64').toString('hex');
            let value = Buffer.from(params.value['bytes'], 'base64');

            for (let i = setup['saver_app']['config']['starting_prime_id']; i < setup['saver_app']['config']['ending_prime_id']; i++) {
                let index = Buffer.from(chain.reference('Prime', i)).toString('hex');

                if (key == index) {
                    let prime = {
                        id: null,
                        parent_id: null,
                        asset_id: null,
                        legacy_id: null,
                        score: null,
                        royalties: null,
                        rewards: null,
                        price: null,
                        theme: null,
                        skin: null,
                        name: null,
                    };

                    prime.id = connection.baseClient.decodeUint64(value.subarray(0, 4));
                    prime.parent_id = connection.baseClient.decodeUint64(value.subarray(4, 8));
                    prime.asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    prime.legacy_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    prime.score = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    prime.royalties = connection.baseClient.decodeUint64(value.subarray(32, 40));
                    prime.rewards = connection.baseClient.decodeUint64(value.subarray(40, 48));
                    prime.price = connection.baseClient.decodeUint64(value.subarray(48, 56));
                    prime.theme = connection.baseClient.decodeUint64(value.subarray(56, 58));
                    prime.skin = connection.baseClient.decodeUint64(value.subarray(58, 60));
                    prime.name = value.subarray(60, 68).toString('utf-8').trim();

                    primes.push(prime);

                    break;
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
