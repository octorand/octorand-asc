require('dotenv').config();

const fs = require('fs');
var sharp = require('sharp');

exports.execute = async function () {

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen2/prime/graphics.json'));
    let primes = graphics['primes'];

    for (let i = 0; i < primes.length; i++) {
        let prime = primes[i];

        let source = 'src/deploy/mainnet/gen2/prime/graphics/svg/' + prime.id + '.svg';
        let destination = 'src/deploy/mainnet/gen2/prime/graphics/png/' + prime.id + '.png';

        await sharp(source)
            .toFormat('png')
            .toFile(destination)
            .catch(function (err) {
                console.log(err)
            });

        console.log('updated graphic png ' + i);
    }

    console.log('updated graphic pngs');
}

