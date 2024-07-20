require('dotenv').config();

exports.execute = async function () {

    console.log('launchpad guardians item setup contracts');
    await require('./item/00_compile_contracts').execute();
    // await require('./item/01_create_main_application').execute();
    // await require('./item/02_create_sub_applications').execute();
    // await require('./item/03_update_applications').execute();

    console.log('launchpad guardians item setup resources');
    // await require('./item/04_setup_item_input').execute();
    // await require('./item/05_create_item_asset').execute();
    // await require('./item/06_create_legacy_asset').execute();
    // await require('./item/07_fund_application').execute();
    // await require('./item/08_call_initialize').execute();
    // await require('./item/09_call_populate').execute();
    // await require('./item/10_transfer_assets').execute();
    // await require('./item/11_lock_item_asset').execute();

    console.log('launchpad guardians item call functions');
    // await require('./item/12_update_main_application').execute();
    // await require('./item/13_call_upgrade').execute();
    // await require('./item/14_call_mint').execute();
    // await require('./item/15_call_withdraw').execute();
    // await require('./item/16_call_list').execute();
    // await require('./item/17_call_unlist').execute();
    // await require('./item/18_call_list').execute();
    // await require('./item/19_call_buy').execute();
    // await require('./item/20_call_rename').execute();
    // await require('./item/21_call_repaint').execute();
    // await require('./item/22_call_optin').execute();
    // await require('./item/23_call_optout').execute();
    // await require('./item/24_call_claim').execute();
    // await require('./item/25_call_refresh').execute();
    // await require('./item/26_call_fire').execute();
    // await require('./item/27_optin_asset').execute();
    // await require('./item/28_transfer_assets').execute();
    // await require('./item/29_call_move').execute();
    // await require('./item/30_call_unlist').execute();
    // await require('./item/31_call_move').execute();
    // await require('./item/32_call_buy').execute();

    console.log('launchpad guardians item read states');
    // await require('./item/33_read_logs').execute();
    // await require('./item/34_read_state').execute();

    console.log('launchpad guardians item manage legacy');
    // await require('./item/35_create_legacy_application').execute();
    // await require('./item/36_fund_legacy_application').execute();
    // await require('./item/37_update_legacy_application').execute();
    // await require('./item/38_optout_legacy_application').execute();
    // await require('./item/39_withdraw_legacy_application').execute();
    // await require('./item/40_delete_legacy_application').execute();
}
