require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));

        let prime = setup['gen1']['inputs']['prime'];

        if (!prime['id']) {
            prime = {
                id: 1,
                theme: 1,
                skin: 2,
                is_founder: 1,
                is_artifact: 0,
                is_pioneer: 1,
                is_explorer: 0,
                score: 750,
                sales: 15,
                mints: 25,
                renames: 5,
                repaints: 10,
                name: 'ABCDWXYZ',
                description: 'Notes',
                price: 350
            }

            setup['gen1']['inputs']['prime'] = prime;
            fs.writeFileSync('src/app/test/setup.json', JSON.stringify(setup, null, 4));

            console.log('setup prime input');
        };

    } catch (error) {
        console.log(error);
    }
}
