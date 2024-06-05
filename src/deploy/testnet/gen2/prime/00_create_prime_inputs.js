require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
        let legacy = JSON.parse(fs.readFileSync('src/deploy/testnet/gen2/prime/legacy.json'));

        let primes = config['gen2']['inputs']['primes'];

        if (primes.length == 0) {
            for (let i = 0; i < 8000; i++) {
                let source = legacy['primes'].find(p => p.id == i);
                let parent = config['gen1']['inputs']['primes'].find(p => p.id == source.parent_id);
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
                    parent_application_id: parent ? parent['application_id'] : 0
                });
            }
        } else {
            for (let i = 0; i < 8000; i++) {
                let source = legacy['primes'].find(p => p.id == i);
                let parent = config['gen1']['inputs']['primes'].find(p => p.id == source.parent_id);
                primes[i].id = i;
                primes[i].parent_id = source.parent_id;
                primes[i].theme = source.theme;
                primes[i].skin = source.skin;
                primes[i].is_founder = source.is_founder;
                primes[i].is_artifact = source.is_artifact;
                primes[i].is_pioneer = source.is_pioneer;
                primes[i].is_explorer = source.is_explorer;
                primes[i].score = source.score;
                primes[i].sales = source.sales;
                primes[i].drains = source.drains;
                primes[i].transforms = source.transforms;
                primes[i].vaults = source.vaults;
                primes[i].name = source.name;
                primes[i].parent_application_id = parent ? parent['application_id'] : 0
            }
        }

        config['gen2']['inputs']['primes'] = primes;
        fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));
    } catch (error) {
        console.log(error);
    }
}