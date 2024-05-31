require('dotenv').config();

exports.execute = async function () {

    console.log('deploy gen1 design application');
    await require('./design/00_compile_contract').execute();
    await require('./design/01_create_application').execute();
    await require('./design/02_update_application').execute();

    console.log('deploy gen1 market application');
    await require('./market/00_compile_contract').execute();
    await require('./market/01_create_application').execute();
    await require('./market/02_update_application').execute();

    console.log('deploy gen1 vault application');
    await require('./vault/00_compile_contract').execute();
    await require('./vault/01_create_application').execute();
    await require('./vault/02_update_application').execute();

    console.log('deploy gen1 wallet application');
    await require('./wallet/00_compile_contract').execute();
    await require('./wallet/01_create_application').execute();
    await require('./wallet/02_update_application').execute();

    console.log('config gen1 storage application');
    await require('./storage/00_compile_contract').execute();
    await require('./storage/01_setup_prime_input').execute();
    await require('./storage/02_create_legacy_asset').execute();
    await require('./storage/03_create_prime_asset').execute();
    await require('./storage/04_create_application').execute();
    await require('./storage/05_fund_application').execute();
    // await require('./storage/06_call_initialize').execute();
    // await require('./storage/07_call_populate').execute();
    // await require('./storage/08_call_finalize').execute();
    // await require('./storage/09_transfer_assets').execute();
    // await require('./storage/10_lock_prime_asset').execute();
    // await require('./storage/11_update_application').execute();

    // console.log('config gen1 wallet application');
    // await require('./wallet/03_call_upgrade').execute();
    // await require('./wallet/04_call_mint').execute();
    // await require('./wallet/05_call_withdraw').execute();
    // await require('./wallet/06_read_application_logs').execute();

    // console.log('config gen1 market application');
    // await require('./market/03_call_list').execute();
    // await require('./market/04_call_unlist').execute();
    // await require('./market/05_call_list').execute();
    // await require('./market/06_call_buy').execute();
    // await require('./market/07_read_application_logs').execute();

    // console.log('config gen1 design application');
    // await require('./design/03_call_rename').execute();
    // await require('./design/04_call_repaint').execute();
    // await require('./design/05_call_describe').execute();
    // await require('./design/06_read_application_logs').execute();

    // console.log('config gen1 vault application');
    // await require('./vault/03_call_optin').execute();
    // await require('./vault/04_call_optout').execute();
    // await require('./vault/05_read_application_logs').execute();

    // console.log('read gen1 storage application');
    // await require('./storage/12_read_application_logs').execute();
    // await require('./storage/13_read_application_state').execute();

}
