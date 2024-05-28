require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));

        let wallet = config['gen1']['contracts']['wallet'];

        if (!wallet['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/gen1/wallet/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/gen1/wallet/clear.teal', 'utf8');

            console.log('gen1 wallet approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 wallet clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
