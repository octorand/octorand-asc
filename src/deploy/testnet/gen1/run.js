require('dotenv').config();

exports.execute = async function () {

    console.log('gen1 prime setup resources');
    await require('./prime/00_create_prime_inputs').execute();
    await require('./prime/01_create_legacy_assets').execute();
    await require('./prime/02_create_prime_assets').execute();
    await require('./prime/03_create_main_applications').execute();
    await require('./prime/04_update_main_applications').execute();
    await require('./prime/05_fund_main_applications').execute();
    await require('./prime/06_initialize_main_applications').execute();
    await require('./prime/07_populate_main_applications').execute();

}
