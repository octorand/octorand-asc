require('dotenv').config();

exports.execute = async function () {

    console.log('setup asset requirements');
    await require('./asset/00_create_platform_asset').execute();
    await require('./asset/01_create_vault_asset').execute();
    await require('./asset/02_optin_gen1').execute();
    await require('./asset/03_optin_gen2').execute();
    await require('./asset/04_optin_player').execute();
    await require('./asset/05_transfer_assets').execute();

}
