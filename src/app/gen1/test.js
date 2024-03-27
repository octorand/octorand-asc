require('dotenv').config();

(async () => {
    // await require('./command/01_create_platform_asset').execute();
    // await require('./command/02_create_main_app').execute();
    // await require('./command/03_fund_main_app').execute();
    // await require('./command/04_update_main_app').execute();
    // await require('./command/05_init_main_app').execute();
    await require('./command/06_read_main_app_config').execute();
})();