require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let primes = setup['primes'];

        let count = 1;

        for (let i = 0; i < count; i++) {
            let prime = primes.find(p => p.id == i);
            if (!prime) {
                primes.push({
                    id: i,
                    theme: 1,
                    skin: 2,
                    is_founder: 1,
                    is_artifact: 0,
                    is_pioneer: 1,
                    is_explorer: 0,
                    score: 750,
                    renames: 5,
                    repaints: 10,
                    sales: 15,
                    name: 'ABCDWXYZ',
                    description: 'Notes',
                    price: 350
                });
            }
        }

        setup['primes'] = primes;
        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('initialized primes');

    } catch (error) {
        console.log(error);
    }
}
