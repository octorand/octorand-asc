require('dotenv').config();

exports.execute = async function () {

    console.log('init requirements');
    await require('./init/00_create_platform_asset').execute();
    await require('./init/01_create_vault_asset').execute();
    await require('./init/02_optin_gen1').execute();
    await require('./init/03_optin_gen2').execute();
    await require('./init/04_optin_player').execute();
    await require('./init/05_transfer_assets').execute();

}
