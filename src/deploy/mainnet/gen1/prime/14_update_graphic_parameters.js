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
        let id = i;
        let name = '';
        let theme = 0;
        let skin = 0;

        primes.push({
            id: id,
            name: name,
            skin: skin,
            theme: theme
        });
    }

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
    graphics['primes'] = primes;

    fs.writeFileSync('src/deploy/mainnet/gen1/prime/graphics.json', JSON.stringify(graphics, null, 4));

    console.log('updated graphics');
}