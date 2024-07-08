require('dotenv').config();

const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {

    let connection = await mainnet.get();

    let limit = 1000;
    let key = 'applications';
    let applications = [];

    let pager = await helpers.pager(connection.indexerClient.lookupAccountCreatedApplications(connection.gen1.addr), limit, key);
    for (let i = 0; i < pager.length; i++) {
        applications.push(pager[i]);
    }

    let primes = [];

    for (let i = 0; i < applications.length; i++) {
        let id = 0;
        let theme = 0;
        let skin = 0;
        let name = '';

        let global = applications[i]['params']['global-state'];

        for (let j = 0; j < global.length; j++) {
            let params = global[j];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'P1':
                    id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    theme = connection.baseClient.decodeUint64(value.subarray(40, 42));
                    skin = connection.baseClient.decodeUint64(value.subarray(42, 44));
                    name = value.subarray(104, 112).toString('utf-8').trim();
                    break;
            }
        }

        primes.push({
            id: id,
            theme: theme,
            skin: skin,
            name: name,
        });
    }

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
    graphics['primes'] = primes;

    fs.writeFileSync('src/deploy/mainnet/gen1/prime/graphics.json', JSON.stringify(graphics, null, 4));

    console.log('updated graphic parameters');
}