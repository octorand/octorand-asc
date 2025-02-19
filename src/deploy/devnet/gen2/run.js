require('dotenv').config();

exports.execute = async function () {

    console.log('gen2 prime setup contracts');
    await require('./prime/00_compile_contracts').execute();
    await require('./prime/01_create_main_application').execute();
    await require('./prime/02_create_sub_applications').execute();
    await require('./prime/03_update_applications').execute();

    console.log('gen2 prime setup resources');
    await require('./prime/04_setup_prime_input').execute();
    await require('./prime/05_create_prime_asset').execute();
    await require('./prime/06_create_legacy_asset').execute();
    await require('./prime/07_fund_application').execute();
    await require('./prime/08_call_initialize').execute();
    await require('./prime/09_call_populate').execute();
    await require('./prime/10_transfer_assets').execute();
    await require('./prime/11_lock_prime_asset').execute();

    console.log('gen2 prime call functions');
    await require('./prime/12_update_main_application').execute();
    await require('./prime/13_call_upgrade').execute();
    await require('./prime/14_call_mint').execute();
    await require('./prime/15_call_withdraw').execute();
    await require('./prime/16_call_list').execute();
    await require('./prime/17_call_unlist').execute();
    await require('./prime/18_call_list').execute();
    await require('./prime/19_call_buy').execute();
    await require('./prime/20_call_rename').execute();
    await require('./prime/21_call_repaint').execute();
    await require('./prime/22_call_optin').execute();
    await require('./prime/23_call_optout').execute();
    await require('./prime/24_call_claim').execute();
    await require('./prime/25_call_refresh').execute();
    await require('./prime/26_call_fire').execute();
    await require('./prime/27_optin_asset').execute();
    await require('./prime/28_transfer_assets').execute();
    await require('./prime/29_call_move').execute();
    await require('./prime/30_call_unlist').execute();
    await require('./prime/31_call_move').execute();
    await require('./prime/32_call_buy').execute();

    console.log('gen2 prime read states');
    await require('./prime/33_read_logs').execute();
    await require('./prime/34_read_state').execute();

    console.log('gen2 prime manage legacy');
    await require('./prime/35_create_legacy_application').execute();
    await require('./prime/36_fund_legacy_application').execute();
    await require('./prime/37_update_legacy_application').execute();
    await require('./prime/38_optout_legacy_application').execute();
    await require('./prime/39_withdraw_legacy_application').execute();
    await require('./prime/40_delete_legacy_application').execute();
}
