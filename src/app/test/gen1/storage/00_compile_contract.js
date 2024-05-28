require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../lib/chain');

exports.execute = async function () {
    try {

        let setup = JSON.parse(fs.readFileSync('src/app/test/setup.json'));

        let storage = setup['gen1']['contracts']['storage'];

        if (!storage['application_id']) {
            let approvalProgram = fs.readFileSync('src/app/build/gen1/storage/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/app/build/gen1/storage/clear.teal', 'utf8');

            console.log('gen1 storage approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 storage clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
