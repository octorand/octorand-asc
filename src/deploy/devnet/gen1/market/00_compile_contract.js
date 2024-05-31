require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let market = config['gen1']['contracts']['market'];

        if (!market['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/devnet/gen1/market/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen1/market/clear.teal', 'utf8');

            console.log('gen1 market approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 market clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
