require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
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
                name: 'ABCDWXYZ',
                price: 350,
                sales: 10,
                drains: 20,
                transforms: 30
            }

            config['gen1']['inputs']['prime'] = prime;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('config prime input');
        };

    } catch (error) {
        console.log(error);
    }
}
