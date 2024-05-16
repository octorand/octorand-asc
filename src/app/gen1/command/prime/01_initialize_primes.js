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
                    parent_id: 0,
                    theme: Math.floor(Math.random() * 4),
                    skin: Math.floor(Math.random() * 4),
                    is_founder: Math.floor(Math.random() * 2),
                    is_artifact: Math.floor(Math.random() * 2),
                    is_pioneer: Math.floor(Math.random() * 2),
                    is_explorer: Math.floor(Math.random() * 2),
                    score: Math.floor(Math.random() * 1000),
                    renames: Math.floor(Math.random() * 10),
                    repaints: Math.floor(Math.random() * 10),
                    sales: Math.floor(Math.random() * 10),
                    name: 'ABCDWXYZ',
                    description: 'Notes',
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
