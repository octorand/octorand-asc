require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));
    let legacy = JSON.parse(fs.readFileSync('src/deploy/mainnet/launchpad/guardians/item/items.json'));

    let items = config['launchpad']['guardians']['inputs']['items'];
    let max = config['launchpad']['guardians']['inputs']['max'];

    if (items.length == 0) {
        for (let i = 0; i < max; i++) {
            let source = legacy['items'].find(x => x.id == i);
            items.push({
                id: i,
                name: source.name,
                owner: source.owner,
                rewards: source.rewards,
                score: source.score,
                rank: source.rank,
                image: source.image,
                asset_id: source.asset_id,
                legacy_application_id: source.application_id,
                legacy_application_address: source.application_address,
            });
        }
    } else {
        for (let i = 0; i < max; i++) {
            let source = legacy['items'].find(p => p.id == i);
            items[i].id = i;
            items[i].name = source.name;
            items[i].owner = source.owner;
            items[i].rewards = source.rewards;
            items[i].score = source.score;
            items[i].rank = source.rank;
            items[i].image = source.image;
            items[i].asset_id = source.asset_id;
            items[i].legacy_application_id = source.application_id;
            items[i].legacy_application_address = source.application_address;
        }
    }

    items.sort((first, second) => first.id - second.id);

    config['launchpad']['guardians']['inputs']['items'] = items;
    fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

}