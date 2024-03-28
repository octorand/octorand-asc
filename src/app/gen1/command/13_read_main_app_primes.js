require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = [];

        for (let i = 0; i < setup['main_app']['config']['primes_count']; i++) {
            let prime = {
                id: null,
                asset_id: null
            };

            let primeInfo = await connection.indexerClient.lookupApplicationBoxByIDandName(setup['main_app']['id'], chain.reference('Prime', i)).do();
            let value = primeInfo.value;

            prime.id = connection.baseClient.decodeUint64(value.subarray(0, 4));
            prime.asset_id = connection.baseClient.decodeUint64(value.subarray(4, 12));

            primes.push(prime);
        }

        setup['main_app']['primes'] = primes;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main app primes');

    } catch (error) {
        console.log(error);
    }
}
