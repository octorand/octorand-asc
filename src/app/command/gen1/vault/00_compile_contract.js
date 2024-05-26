require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {

        let vault = setup['gen1']['contracts']['vault'];

        if (!vault['application_id']) {
            let approvalProgram = fs.readFileSync('src/app/build/gen1/vault/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/app/build/gen1/vault/clear.teal', 'utf8');

            console.log('gen1 vault approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 vault clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
