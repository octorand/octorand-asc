require('dotenv').config();

const fs = require('fs');
const cids = require('cids')
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {
    try {
        let connection = await mainnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

        let ipfs = config['setup']['ipfs'];
        let cid = new cids(ipfs['cid']);
        let hash = Buffer.from(cid.multihash.slice(-32));
        let reserve = connection.baseClient.encodeAddress(Uint8Array.from(Buffer.from(hash)));

        ipfs['reserve'] = reserve;

        config['setup']['ipfs'] = ipfs;
        fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}