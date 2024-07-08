require('dotenv').config();

const fs = require('fs');
const builder = require('svg-builder');
const colors = require('./../../../../chain/util/colors');

exports.execute = async function () {

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
    let primes = graphics['primes'];

    for (let i = 0; i < primes.length; i++) {
        let prime = primes[i];

        let svg = builder;
        svg = svg.height(200);
        svg = svg.width(200);

        fs.writeFileSync('src/deploy/mainnet/gen1/prime/graphics/svg/' + prime.id + '.svg', svg.render());

        console.log('updated graphic svg ' + i);

        break;
    }

    console.log('updated graphic svgs');
}