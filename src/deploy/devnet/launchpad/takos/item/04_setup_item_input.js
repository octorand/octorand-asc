require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let item = config['launchpad']['takos']['inputs']['item'];

        if (!item['id']) {
            item = {
                id: 1,
                name: 'TESTER',
                price: 550,
                owner: 'HOBH3SYPFUU36ZVSL3BDNNLYG52JSXOICLIFTWIGWYF4ZUQ7QML2AE3G3Y',
            }

            config['launchpad']['takos']['inputs']['item'] = item;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('config takos item input');
        };
    } catch (error) {
        console.log(error);
    }
}
