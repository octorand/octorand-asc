require('dotenv').config();

(async () => {
    // await require('./command/01_create_platform_asset').execute();
    // await require('./command/02_create_main_app').execute();
    // await require('./command/03_fund_main_app').execute();
    // await require('./command/04_update_main_app').execute();
    // await require('./command/05_init_main_app').execute();
    // await require('./command/06_read_main_app_config').execute();
    // await require('./command/07_create_saver_app').execute();
    // await require('./command/08_update_saver_app').execute();
    // await require('./command/09_init_saver_app').execute();
    // await require('./command/10_read_saver_app_config').execute();
    // await require('./command/11_init_main_app_saver').execute();
    // await require('./command/12_create_primes').execute();
    // await require('./command/06_read_main_app_config').execute();
    // await require('./command/13_read_main_app_primes').execute();
    // await require('./command/10_read_saver_app_config').execute();
    // await require('./command/14_read_saver_app_primes').execute();
    // await require('./command/15_update_prime_asset').execute();
    // await require('./command/16_update_prime').execute();
    await require('./command/13_read_main_app_primes').execute();
    await require('./command/14_read_saver_app_primes').execute();
})();