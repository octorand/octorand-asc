require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = setup['primes'];

        let count = 5;

        for (let i = 0; i < count; i++) {
            let prime = primes.find(p => p.id == i);
            if (!prime) {
                primes.push({
                    id: i
                });
            }
        }

        setup['primes'] = primes;
        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('initialised primes');

    } catch (error) {
        console.log(error);
    }
}
