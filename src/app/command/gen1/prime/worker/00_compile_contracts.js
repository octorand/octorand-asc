require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {

        let approvalProgram = fs.readFileSync('src/app/build/gen1/prime/worker/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/build/gen1/prime/worker/clear.teal', 'utf8');

        console.log('gen1 prime worker approval program length is ' + (await chain.compile(approvalProgram)).length + ' bytes');
        console.log('gen1 prime worker clear program length is ' + (await chain.compile(clearProgram)).length + ' bytes');

    } catch (error) {
        console.log(error);
    }
}
