require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
    let legacy = JSON.parse(fs.readFileSync('src/deploy/testnet/gen2/prime/legacy.json'));

    let primes = config['gen2']['inputs']['primes'];

    if (primes.length == 0) {
        for (let i = 0; i < 10; i++) {
            let parent = config['gen1']['inputs']['primes'].find(p => p.id == i);
            let children = legacy['primes'].filter(p => p.parent_id == i);

            for (let j = 0; j < 8; j++) {
                let child = children[j];
                let id = (j * 10) + i;

                primes.push({
                    id: id,
                    parent_id: child.parent_id,
                    theme: child.theme,
                    skin: child.skin,
                    is_founder: child.is_founder,
                    is_artifact: child.is_artifact,
                    is_pioneer: child.is_pioneer,
                    is_explorer: child.is_explorer,
                    score: child.score,
                    sales: child.sales,
                    drains: child.drains,
                    transforms: child.transforms,
                    vaults: child.vaults,
                    name: child.name,
                    owner: child.owner,
                    rewards: child.rewards,
                    royalties: child.royalties,
                    parent_application_id: parent['application_id']
                });
            }
        }
    } else {
        for (let i = 0; i < 10; i++) {
            let parent = config['gen1']['inputs']['primes'].find(p => p.id == i);
            let children = legacy['primes'].filter(p => p.parent_id == i);

            for (let j = 0; j < 8; j++) {
                let child = children[j];
                let id = (j * 10) + i;

                primes[id].id = id;
                primes[id].parent_id = child.parent_id;
                primes[id].theme = child.theme;
                primes[id].skin = child.skin;
                primes[id].is_founder = child.is_founder;
                primes[id].is_artifact = child.is_artifact;
                primes[id].is_pioneer = child.is_pioneer;
                primes[id].is_explorer = child.is_explorer;
                primes[id].score = child.score;
                primes[id].sales = child.sales;
                primes[id].drains = child.drains;
                primes[id].transforms = child.transforms;
                primes[id].vaults = child.vaults;
                primes[id].name = child.name;
                primes[id].owner = child.owner;
                primes[id].rewards = child.rewards;
                primes[id].royalties = child.royalties;
                primes[id].parent_application_id = parent['application_id'];
            }
        }
    }

    primes.sort((first, second) => first.id - second.id);

    config['gen2']['inputs']['primes'] = primes;
    fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

}