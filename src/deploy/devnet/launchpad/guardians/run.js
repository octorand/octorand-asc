require('dotenv').config();

exports.execute = async function () {

    console.log('launchpad guardians item setup contracts');
    await require('./item/00_compile_contracts').execute();
    await require('./item/01_create_main_application').execute();
    await require('./item/02_create_sub_applications').execute();
    await require('./item/03_update_applications').execute();

    console.log('launchpad guardians item setup resources');
    await require('./item/04_setup_item_input').execute();
    await require('./item/05_create_item_asset').execute();
    await require('./item/06_fund_application').execute();
    await require('./item/07_call_initialize').execute();
    await require('./item/08_transfer_assets').execute();

    console.log('launchpad guardians item call functions');
    await require('./item/09_call_mint').execute();
    await require('./item/10_call_list').execute();
    await require('./item/11_call_unlist').execute();
    await require('./item/12_call_list').execute();
    await require('./item/13_call_buy').execute();
    await require('./item/14_call_rename').execute();
    await require('./item/15_call_claim').execute();
    await require('./item/16_call_refresh').execute();
    await require('./item/17_call_fire').execute();
    await require('./item/18_optin_asset').execute();
    await require('./item/19_transfer_assets').execute();
    await require('./item/20_call_move').execute();
    await require('./item/21_call_unlist').execute();
    await require('./item/22_call_move').execute();
    await require('./item/23_call_buy').execute();

    console.log('launchpad guardians item read states');
    await require('./item/24_read_logs').execute();
    await require('./item/25_read_state').execute();

    console.log('launchpad guardians item manage legacy');
    await require('./item/26_create_legacy_application').execute();
    await require('./item/27_fund_legacy_application').execute();
    await require('./item/28_update_legacy_application').execute();
    await require('./item/29_optout_legacy_application').execute();
    await require('./item/30_withdraw_legacy_application').execute();
    await require('./item/31_delete_legacy_application').execute();
}
