require('dotenv').config();

const fs = require('fs');

exports.execute = async function (environment) {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let prime = config['gen1']['inputs']['prime'];

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

            config['gen1']['inputs']['prime'] = prime;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('config prime input');
        };

    } catch (error) {
        console.log(error);
    }
}
