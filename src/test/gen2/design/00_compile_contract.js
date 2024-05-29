require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));

        let design = config['gen2']['contracts']['design'];

        if (!design['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/gen2/design/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/gen2/design/clear.teal', 'utf8');

            console.log('gen2 design approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
            console.log('gen2 design clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');
        }

    } catch (error) {
        console.log(error);
    }
}
