require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let legacy = JSON.parse(fs.readFileSync('src/deploy/testnet/gen1/prime/legacy.json'));

        let primes = config['gen1']['inputs']['prime'];

        if (primes.length == 0) {
            for (let i = 0; i < 1000; i++) {
                let source = legacy['primes'].find(p => p.id == i);

                primes.push({
                    id: i,
                    parent_id: source.parent_id,
                    theme: source.theme,
                    skin: source.skin,
                    is_founder: source.is_founder,
                    is_artifact: source.is_artifact,
                    is_pioneer: source.is_pioneer,
                    is_explorer: source.is_explorer,
                    score: source.score,
                    sales: source.sales,
                    drains: source.drains,
                    transforms: source.transforms,
                    vaults: source.vaults,
                    name: source.name,
                });
            }
        }

        config['gen1']['inputs']['prime'] = primes;
        fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

        console.log('create prime inputs');
    } catch (error) {
        console.log(error);
    }
}