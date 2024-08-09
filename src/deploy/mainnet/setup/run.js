require('dotenv').config();

exports.execute = async function () {

    console.log('setup asset requirements');
    await require('./asset/00_optin_guardians_burner').execute();
    await require('./asset/01_optin_takos_burner').execute();

    console.log('setup ipfs requirements');
    await require('./ipfs/00_generate_reserve_address').execute();

}
