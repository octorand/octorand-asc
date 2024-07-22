require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {

    let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));
    let legacy = JSON.parse(fs.readFileSync('src/deploy/testnet/launchpad/takos/item/items.json'));

    let items = config['launchpad']['takos']['inputs']['items'];

    if (items.length == 0) {
        for (let i = 0; i < 10; i++) {
            let source = legacy['items'].find(x => x.id == i);
            items.push({
                id: i,
                name: source.name,
                owner: source.owner,
                rewards: source.rewards,
                score: source.score,
                rank: source.rank,
                image: source.image
            });
        }
    } else {
        for (let i = 0; i < 10; i++) {
            let source = legacy['items'].find(p => p.id == i);
            items[i].id = i;
            items[i].name = source.name;
            items[i].owner = source.owner;
            items[i].rewards = source.rewards;
            items[i].score = source.score;
            items[i].rank = source.rank;
            items[i].image = source.image;
        }
    }

    items.sort((first, second) => first.id - second.id);

    config['launchpad']['takos']['inputs']['items'] = items;
    fs.writeFileSync('src/deploy/testnet/config.json', JSON.stringify(config, null, 4));

}