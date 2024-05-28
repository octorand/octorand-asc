require('dotenv').config();

(async () => {

    // console.log('deploy design application');
    // await require('./command/gen1/design/00_compile_contract').execute();
    // await require('./command/gen1/design/01_create_application').execute();
    // await require('./command/gen1/design/02_update_application').execute();

    // console.log('deploy market application');
    // await require('./command/gen1/market/00_compile_contract').execute();
    // await require('./command/gen1/market/01_create_application').execute();
    // await require('./command/gen1/market/02_update_application').execute();

    // console.log('deploy vault application');
    // await require('./command/gen1/vault/00_compile_contract').execute();
    // await require('./command/gen1/vault/01_create_application').execute();
    // await require('./command/gen1/vault/02_update_application').execute();

    // console.log('deploy wallet application');
    // await require('./command/gen1/wallet/00_compile_contract').execute();
    // await require('./command/gen1/wallet/01_create_application').execute();
    // await require('./command/gen1/wallet/02_update_application').execute();

    // console.log('setup storage application');
    // await require('./command/gen1/storage/00_compile_contract').execute();
    // await require('./command/gen1/storage/01_setup_prime_input').execute();
    // await require('./command/gen1/storage/02_create_legacy_asset').execute();
    // await require('./command/gen1/storage/03_create_prime_asset').execute();
    // await require('./command/gen1/storage/04_create_application').execute();
    // await require('./command/gen1/storage/05_fund_application').execute();
    // await require('./command/gen1/storage/06_call_initialize').execute();
    // await require('./command/gen1/storage/07_call_populate').execute();
    // await require('./command/gen1/storage/08_call_finalize').execute();
    // await require('./command/gen1/storage/09_transfer_assets').execute();
    // await require('./command/gen1/storage/10_lock_prime_asset').execute();
    // await require('./command/gen1/storage/11_update_application').execute();

    // console.log('setup wallet application');
    // await require('./command/gen1/wallet/03_call_upgrade').execute();
    // await require('./command/gen1/wallet/04_call_mint').execute();
    // await require('./command/gen1/wallet/05_call_withdraw').execute();
    await require('./command/gen1/wallet/06_read_application_logs').execute();

    // console.log('setup market application');
    // await require('./command/gen1/market/03_call_list').execute();
    // await require('./command/gen1/market/04_call_unlist').execute();
    // await require('./command/gen1/market/05_call_list').execute();
    // await require('./command/gen1/market/06_call_buy').execute();
    // await require('./command/gen1/market/07_read_application_logs').execute();

    // console.log('setup design application');
    // await require('./command/gen1/design/03_call_rename').execute();
    // await require('./command/gen1/design/04_call_repaint').execute();
    // await require('./command/gen1/design/05_call_describe').execute();
    // await require('./command/gen1/design/06_read_application_logs').execute();

    // console.log('setup vault application');
    // await require('./command/gen1/vault/03_call_optin').execute();
    // await require('./command/gen1/vault/04_call_optout').execute();
    // await require('./command/gen1/vault/05_read_application_logs').execute();

    // console.log('read storage application');
    // await require('./command/gen1/storage/12_read_application_logs').execute();
    // await require('./command/gen1/storage/13_read_application_state').execute();

})();