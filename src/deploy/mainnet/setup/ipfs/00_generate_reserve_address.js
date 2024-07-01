require('dotenv').config();

const fs = require('fs');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

        let ipfs = config['setup']['ipfs'];
        let cid = ipfs['cid'];

        let reserve = 'XX';

        ipfs['reserve'] = reserve;

        config['setup']['ipfs'] = ipfs;
        fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}