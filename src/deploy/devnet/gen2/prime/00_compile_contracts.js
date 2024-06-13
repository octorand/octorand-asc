require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let contracts = ['app', 'buy', 'claim', 'list', 'mint', 'optin', 'optout', 'rename', 'repaint', 'unlist', 'upgrade', 'withdraw'];

        for (let i = 0; i < contracts.length; i++) {
            let contract = contracts[i];

            let application = config['gen2']['contracts']['prime'][contract];

            if (!application['application_id']) {
                let approvalProgram = fs.readFileSync('src/build/devnet/gen2/prime/' + contract + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/gen2/prime/' + contract + '/clear.teal', 'utf8');

                console.log('gen2 prime ' + contract + ' approval program length is ' + (await devnet.compile(approvalProgram)).length + ' bytes');
                console.log('gen2 prime ' + contract + ' clear program length is ' + (await devnet.compile(clearProgram)).length + ' bytes');
            }
        }
    } catch (error) {
        console.log(error);
    }
}
