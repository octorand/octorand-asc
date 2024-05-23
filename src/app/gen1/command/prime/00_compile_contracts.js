require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../../chain/index');

exports.execute = async function () {
    try {

        let approvalProgram = fs.readFileSync('src/app/gen1/build/prime/approval.teal', 'utf8');
        let clearProgram = fs.readFileSync('src/app/gen1/build/prime/clear.teal', 'utf8');

        console.log((await chain.compile(approvalProgram)).length);
        console.log((await chain.compile(clearProgram)).length);

    } catch (error) {
        console.log(error);
    }
}
