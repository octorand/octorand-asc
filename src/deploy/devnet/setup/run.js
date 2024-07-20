require('dotenv').config();

exports.execute = async function () {

    console.log('setup asset requirements');
    await require('./asset/00_create_platform_asset').execute();
    await require('./asset/01_create_vault_asset').execute();
    await require('./asset/02_create_guardians_asset').execute();
    await require('./asset/03_create_takos_asset').execute();
    await require('./asset/04_optin_gen1').execute();
    await require('./asset/05_optin_gen2').execute();
    await require('./asset/06_optin_guardians_manager').execute();
    await require('./asset/07_optin_guardians_artist').execute();
    await require('./asset/08_optin_guardians_treasury').execute();
    await require('./asset/09_optin_takos_manager').execute();
    await require('./asset/10_optin_takos_artist').execute();
    await require('./asset/11_optin_takos_treasury').execute();
    await require('./asset/12_optin_player').execute();
    await require('./asset/13_transfer_assets').execute();

}
