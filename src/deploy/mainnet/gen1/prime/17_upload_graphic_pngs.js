require('dotenv').config();

const axios = require('axios');
const cids = require('cids')
const forms = require('form-data');
const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();

    let config = JSON.parse(fs.readFileSync('src/deploy/mainnet/config.json'));

    let max = config['gen1']['inputs']['max'];

    for (let i = 0; i < max; i++) {
        let primes = config['gen1']['inputs']['primes'];

        let source = 'src/deploy/mainnet/gen1/prime/graphics/png/' + primes[i].id + '.png';
        let token = Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64');

        var data = new forms();
        data.append('file', fs.createReadStream(source));

        var request = {
            method: 'post',
            url: 'https://ipfs.infura.io:5001/api/v0/add',
            headers: {
                'Authorization': 'Basic ' + token,
                ...data.getHeaders()
            },
            data: data
        };

        const res = await axios(request);

        let cid = new cids(res.data.Hash);
        let hash = Buffer.from(cid.multihash.slice(-32));
        let reserve = connection.baseClient.encodeAddress(Uint8Array.from(Buffer.from(hash)));

        if (primes[i]['asset_reserve'] != reserve) {
            primes[i]['asset_cid'] = res.data.Hash;
            primes[i]['asset_reserve'] = reserve;
            primes[i]['asset_version'] = 0;

            config['gen1']['inputs']['primes'] = primes;
            fs.writeFileSync('src/deploy/mainnet/config.json', JSON.stringify(config, null, 4));

            console.log('uploaded graphic png ' + i);
        }

        break;
    }

    console.log('uploaded graphic pngs');
}

