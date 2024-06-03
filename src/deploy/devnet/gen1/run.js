require('dotenv').config();

exports.execute = async function () {

    console.log('setup gen1 prime contracts');
    await require('./prime/00_compile_contracts').execute();
    await require('./prime/01_create_applications').execute();
    await require('./prime/02_update_applications').execute();

    console.log('setup gen1 prime resources');
    await require('./prime/03_setup_prime_input').execute();
    await require('./prime/04_create_prime_asset').execute();
    await require('./prime/05_create_legacy_asset').execute();
    await require('./prime/06_fund_application').execute();
    await require('./prime/07_call_initialize').execute();
    await require('./prime/08_call_populate').execute();
    await require('./prime/09_call_finalize').execute();
    await require('./prime/10_transfer_assets').execute();
    await require('./prime/11_lock_prime_asset').execute();

    console.log('call gen1 prime functions');
    await require('./prime/12_call_upgrade').execute();
    await require('./prime/13_call_mint').execute();
    await require('./prime/14_call_withdraw').execute();
    await require('./prime/15_call_list').execute();
    await require('./prime/16_call_unlist').execute();
    await require('./prime/17_call_list').execute();
    await require('./prime/18_call_buy').execute();
    await require('./prime/19_call_rename').execute();
    await require('./prime/20_call_repaint').execute();
    await require('./prime/21_call_optin').execute();
    await require('./prime/22_call_optout').execute();




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
    // await require('./design/05_read_application_logs').execute();

    // console.log('config gen1 vault application');
    // await require('./vault/03_call_optin').execute();
    // await require('./vault/04_call_optout').execute();
    // await require('./vault/05_read_application_logs').execute();

    // console.log('read gen1 storage application');
    // await require('./storage/12_read_application_logs').execute();
    // await require('./storage/13_read_application_state').execute();

}
