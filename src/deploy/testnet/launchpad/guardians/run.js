require('dotenv').config();

exports.execute = async function () {

    console.log('launchpad guardians item setup contracts');
    await require('./item/00_create_item_inputs').execute();
    await require('./item/01_create_item_assets').execute();

    console.log('launchpad guardians item setup resources');
    await require('./item/02_create_main_applications').execute();
    await require('./item/03_update_main_applications').execute();
    await require('./item/04_create_sub_applications').execute();
    // await require('./item/05_update_sub_applications').execute();
    // await require('./item/06_refresh_main_applications').execute();
}
