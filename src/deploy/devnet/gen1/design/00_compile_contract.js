require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function (environment) {
    try {

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let design = config['gen1']['contracts']['design'];

        if (!design['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/gen1/design/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/gen1/design/clear.teal', 'utf8');

            console.log('gen1 design approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 design clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
