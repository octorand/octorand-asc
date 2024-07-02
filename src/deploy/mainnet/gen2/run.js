require('dotenv').config();

exports.execute = async function () {

    console.log('gen2 prime setup resources');
    await require('./prime/00_create_prime_inputs').execute();
    await require('./prime/01_create_prime_assets').execute();
    // await require('./prime/02_update_prime_assets').execute();

    console.log('gen2 prime setup contracts');
    // await require('./prime/03_create_main_applications').execute();
    // await require('./prime/04_update_main_applications').execute();
    // await require('./prime/05_lock_main_applications').execute();
    // await require('./prime/06_create_sub_applications').execute();
    // await require('./prime/07_update_sub_applications').execute();
    // await require('./prime/08_refresh_main_applications').execute();

}
