require('dotenv').config();

exports.execute = async function () {

    console.log('gen2 prime setup resources');
    await require('./prime/00_create_prime_inputs').execute();
    // await require('./prime/01_create_legacy_assets').execute();
    // await require('./prime/02_create_prime_assets').execute();

    console.log('gen2 prime setup contracts');
    // await require('./prime/03_create_main_applications').execute();
    // await require('./prime/04_update_main_applications').execute();
    // await require('./prime/05_fund_main_applications').execute();
    // await require('./prime/06_initialize_main_applications').execute();
    // await require('./prime/07_populate_main_applications').execute();
    // await require('./prime/08_load_main_applications').execute();
    // await require('./prime/09_lock_main_applications').execute();
    // await require('./prime/10_create_sub_applications').execute();
    // await require('./prime/11_update_sub_applications').execute();

}
