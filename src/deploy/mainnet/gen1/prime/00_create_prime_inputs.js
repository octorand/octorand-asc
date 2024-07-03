require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let legacy = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/primes.json'));

    let primes = config['gen1']['inputs']['primes'];
    let max = config['gen1']['inputs']['max'];

    if (primes.length == 0) {
        for (let i = 0; i < max; i++) {
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
                owner: source.owner,
                rewards: source.rewards,
                royalties: source.royalties,
                legacy_asset_id: source.legacy_asset_id,
                legacy_application_id: source.legacy_application_id,
                legacy_application_address: source.legacy_application_address
            });
        }
    } else {
        for (let i = 0; i < max; i++) {
            let source = legacy['primes'].find(p => p.id == i);
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
            primes[i].owner = source.owner;
            primes[i].rewards = source.rewards;
            primes[i].royalties = source.royalties;
            primes[i].legacy_asset_id = source.legacy_asset_id;
            primes[i].legacy_application_id = source.legacy_application_id;
            primes[i].legacy_application_address = source.legacy_application_address;
        }
    }

    primes.sort((first, second) => first.id - second.id);

    config['gen1']['inputs']['primes'] = primes;
    fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));
}