require('dotenv').config();

const axios = require('axios');
const cids = require('cids')
const forms = require('form-data');
const fs = require('fs');
const mainnet = require('./../../../../chain/mainnet');

exports.execute = async function () {

    let connection = await mainnet.get();

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
    let primes = graphics['primes'];

    for (let i = 0; i < primes.length; i++) {
        let prime = primes[i];

        let source = 'src/deploy/mainnet/gen1/prime/graphics/png/' + prime.id + '.png';
        let token = Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64');

        var data = new forms();
        data.append('file', fs.createReadStream(source));

        var config = {
            method: 'post',
            url: 'https://ipfs.infura.io:5001/api/v0/add',
            headers: {
                'Authorization': 'Basic ' + token,
                ...data.getHeaders()
            },
            data: data
        };

        const res = await axios(config);

        let cid = new cids(res.data.Hash);
        let hash = Buffer.from(cid.multihash.slice(-32));
        let reserve = connection.baseClient.encodeAddress(Uint8Array.from(Buffer.from(hash)));

        primes[i]['cid'] = res.data.Hash;
        primes[i]['reserve'] = reserve;
        primes[i]['version'] = prime.version ? (prime.version + 1) : 0;

        graphics['primes'] = primes;
        fs.writeFileSync('src/deploy/mainnet/gen1/prime/graphics.json', JSON.stringify(graphics, null, 4));

        console.log('uploaded graphic png ' + i);

        break;
    }

    console.log('uploaded graphic pngs');
}

