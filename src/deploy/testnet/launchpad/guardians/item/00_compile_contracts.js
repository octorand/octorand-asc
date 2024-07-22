require('dotenv').config();

const fs = require('fs');
const testnet = require('./../../../../../chain/testnet');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/testnet/config.json'));

        let contracts = ['app', 'buy', 'claim', 'list', 'mint', 'rename', 'unlist'];

        for (let i = 0; i < contracts.length; i++) {
            let contract = contracts[i];

            let application = config['launchpad']['guardians']['contracts']['item'][contract];

            if (!application['application_id']) {
                let approvalProgram = fs.readFileSync('src/build/testnet/launchpad/guardians/item/' + contract + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/testnet/launchpad/guardians/item/' + contract + '/clear.teal', 'utf8');

                console.log('launchpad guardians item ' + contract + ' approval program length is ' + (await testnet.compile(approvalProgram)).length + ' bytes');
                console.log('launchpad guardians item ' + contract + ' clear program length is ' + (await testnet.compile(clearProgram)).length + ' bytes');
            }
        }
    } catch (error) {
        console.log(error);
    }
}
