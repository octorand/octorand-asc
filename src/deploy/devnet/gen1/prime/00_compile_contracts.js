require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let core = config['gen1']['contracts']['prime']['core'];
        if (!core['application_id']) {
            let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/approval.teal', 'utf8');
            let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/clear.teal', 'utf8');

            console.log('gen1 prime approval program length is ' + (await devnet.compile(approvalProgram)).length + ' bytes');
            console.log('gen1 prime clear program length is ' + (await devnet.compile(clearProgram)).length + ' bytes');
        }

        let options = ['buy', 'list', 'mint', 'optin', 'optout', 'rename', 'repaint', 'unlist', 'upgrade', 'withdraw'];

        for (let i = 0; i < options.length; i++) {
            let option = options[i];

            let contract = config['gen1']['contracts']['prime'][option];
            if (!contract['application_id']) {
                let approvalProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/gen1/prime/' + option + '/clear.teal', 'utf8');

                console.log('gen1 prime ' + option + ' approval program length is ' + (await devnet.compile(approvalProgram)).length + ' bytes');
                console.log('gen1 prime ' + option + ' clear program length is ' + (await devnet.compile(clearProgram)).length + ' bytes');
            }
        }

    } catch (error) {
        console.log(error);
    }
}
