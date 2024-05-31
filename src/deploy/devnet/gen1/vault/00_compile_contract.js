require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let vault = config['gen1']['contracts']['vault'];

        if (!vault['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/devnet/gen1/vault/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen1/vault/clear.teal', 'utf8');

            console.log('gen1 vault approval program length is ' + (await devnet.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 vault clear program length is ' + (await devnet.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
