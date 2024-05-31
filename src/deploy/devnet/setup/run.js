require('dotenv').config();

exports.execute = async function (environment) {

    console.log('init requirements');
    await require('./init/00_create_platform_asset').execute(environment);
    await require('./init/01_create_vault_asset').execute(environment);
    await require('./init/02_optin_gen1').execute(environment);
    await require('./init/03_optin_gen2').execute(environment);
    await require('./init/04_optin_player').execute(environment);
    await require('./init/05_transfer_assets').execute(environment);

}
