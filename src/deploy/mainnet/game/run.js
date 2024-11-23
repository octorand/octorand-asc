require('dotenv').config();

exports.execute = async function () {

    console.log('game setup resources');
    await require('./00_create_auth_application').execute();
    await require('./01_create_deposit_application').execute();
    await require('./02_update_applications').execute();

    console.log('game setup contracts');
    await require('./03_initialize_auth_application').execute();
}
