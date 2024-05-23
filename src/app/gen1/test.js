require('dotenv').config();

(async () => {

    await require('./command/prime/01_initialize_primes').execute();
    await require('./command/prime/02_create_legacy_assets').execute();
    await require('./command/prime/03_create_prime_assets').execute();
    await require('./command/prime/04_create_prime_applications').execute();
    await require('./command/prime/05_fund_prime_applications').execute();
    await require('./command/prime/06_update_prime_applications').execute();
    await require('./command/prime/07_initialize_prime_applications').execute();
    await require('./command/prime/08_populate_prime_applications').execute();
    await require('./command/prime/09_finalize_prime_applications').execute();
    await require('./command/prime/10_read_prime_applications').execute();
    await require('./command/prime/11_list_prime_assets').execute();
    await require('./command/prime/12_unlist_prime_assets').execute();

})();