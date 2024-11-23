require('dotenv').config();

exports.execute = async function () {

    console.log('game setup contracts');
    await require('./00_compile_contracts').execute();
    await require('./01_create_auth_application').execute();
    await require('./02_create_deposit_application').execute();
    await require('./03_update_applications').execute();

    console.log('game setup resources');
    await require('./04_call_initialize').execute();

    console.log('game call functions');
    await require('./05_call_auth').execute();
    await require('./06_call_deposit').execute();

    console.log('game read states');
    await require('./07_read_logs').execute();
    await require('./08_read_auth_state').execute();
    await require('./09_read_deposit_state').execute();
}
