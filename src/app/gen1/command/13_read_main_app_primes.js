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
                asset_id: null,
                legacy_id: null,
                score: null,
                health: null,
                wealth: null,
                strength: null,
                theme: null,
                skin: null,
                name: null,
                description: null,
            };

            let primeInfo = await connection.indexerClient.lookupApplicationBoxByIDandName(setup['main_app']['id'], chain.reference('Prime', i)).do();
            let value = primeInfo.value;

            prime.id = connection.baseClient.decodeUint64(value.subarray(0, 4));
            prime.asset_id = connection.baseClient.decodeUint64(value.subarray(4, 12));
            prime.legacy_id = connection.baseClient.decodeUint64(value.subarray(12, 20));
            prime.score = connection.baseClient.decodeUint64(value.subarray(20, 28));
            prime.health = connection.baseClient.decodeUint64(value.subarray(28, 36));
            prime.wealth = connection.baseClient.decodeUint64(value.subarray(36, 44));
            prime.strength = connection.baseClient.decodeUint64(value.subarray(44, 52));
            prime.theme = connection.baseClient.decodeUint64(value.subarray(76, 78));
            prime.skin = connection.baseClient.decodeUint64(value.subarray(78, 80));
            prime.name = value.subarray(80, 88).toString('utf-8').trim();
            prime.description = value.subarray(120, 152).toString('utf-8').trim();

            primes.push(prime);
        }

        setup['main_app']['primes'] = primes;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main app primes');

    } catch (error) {
        console.log(error);
    }
}
