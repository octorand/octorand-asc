require('dotenv').config();

(async () => {

    // await require('./command/prime/01_initialise_primes').execute();
    // await require('./command/prime/02_create_legacy_assets').execute();
    // await require('./command/prime/03_create_prime_assets').execute();
    // await require('./command/prime/04_create_prime_applications').execute();
    // await require('./command/prime/05_fund_prime_applications').execute();
    // await require('./command/prime/06_update_prime_applications').execute();
    // await require('./command/prime/07_init_prime_applications').execute();
    await require('./command/prime/08_read_prime_applications').execute();

})();