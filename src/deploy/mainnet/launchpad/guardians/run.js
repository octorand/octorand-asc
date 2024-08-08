require('dotenv').config();

exports.execute = async function () {

    console.log('launchpad guardians item setup contracts');
    await require('./item/00_create_item_inputs').execute();

    console.log('launchpad guardians item setup resources');
    await require('./item/01_create_sub_applications').execute();
    await require('./item/02_update_sub_applications').execute();
    await require('./item/03_create_main_applications').execute();
    await require('./item/04_update_main_applications').execute();
    await require('./item/05_update_legacy_applications').execute();
}
