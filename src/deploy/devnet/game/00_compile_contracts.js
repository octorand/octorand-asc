require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');

exports.execute = async function () {
    try {
        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let contracts = ['auth', 'deposit'];

        for (let i = 0; i < contracts.length; i++) {
            let contract = contracts[i];

            let application = config['game']['contracts'][contract];

            if (!application['application_id']) {
                let approvalProgram = fs.readFileSync('src/build/devnet/game/' + contract + '/approval.teal', 'utf8');
                let clearProgram = fs.readFileSync('src/build/devnet/game/' + contract + '/clear.teal', 'utf8');

                console.log('game ' + contract + ' approval program length is ' + (await devnet.compile(approvalProgram)).length + ' bytes');
                console.log('game ' + contract + ' clear program length is ' + (await devnet.compile(clearProgram)).length + ' bytes');
            }
        }
    } catch (error) {
        console.log(error);
    }
}
