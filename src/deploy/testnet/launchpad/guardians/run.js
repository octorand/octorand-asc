require('dotenv').config();

exports.execute = async function () {

    console.log('launchpad guardians item setup contracts');
    await require('./item/00_create_item_inputs').execute();
    await require('./item/01_create_item_assets').execute();

    console.log('launchpad guardians item setup resources');
    // await require('./prime/03_create_main_applications').execute();
    // await require('./prime/04_update_main_applications').execute();
    // await require('./prime/05_lock_main_applications').execute();
    // await require('./prime/06_create_sub_applications').execute();
    // await require('./prime/07_update_sub_applications').execute();
    // await require('./prime/08_refresh_main_applications').execute();
}
