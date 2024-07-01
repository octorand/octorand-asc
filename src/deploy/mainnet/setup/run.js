require('dotenv').config();

exports.execute = async function () {

    console.log('setup ipfs requirements');
    await require('./ipfs/00_generate_reserve_address').execute();

}
