require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let vault = config['gen2']['contracts']['vault'];

        if (!vault['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/devnet/gen2/vault/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen2/vault/clear.teal', 'utf8');

            console.log('gen2 vault approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen2 vault clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
