require('dotenv').config();

const fs = require('fs');
const colors = require('./../../../../chain/util/colors');

exports.execute = async function () {

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
    let primes = graphics['primes'];

    for (let i = 0; i < primes.length; i++) {
        console.log('updated graphic svg ' + i);
    }

    console.log('updated graphic svgs');
}