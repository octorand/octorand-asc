require('dotenv').config();

(async () => {

    await require('./command/prime/01_initialise_primes').execute();
    await require('./command/prime/02_create_legacy_assets').execute();
    await require('./command/prime/03_create_prime_assets').execute();

})();