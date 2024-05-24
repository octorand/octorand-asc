require('dotenv').config();

(async () => {

    await require('./command/gen1/logger/00_compile_contracts').execute();

    await require('./command/gen1/prime/loader/00_compile_contracts').execute();
    await require('./command/gen1/prime/loader/01_initialize_primes').execute();
    await require('./command/gen1/prime/loader/02_create_legacy_assets').execute();
    await require('./command/gen1/prime/loader/03_create_prime_assets').execute();
    await require('./command/gen1/prime/loader/04_create_prime_applications').execute();
    await require('./command/gen1/prime/loader/05_fund_prime_applications').execute();
    await require('./command/gen1/prime/loader/06_initialize_prime_applications').execute();
    await require('./command/gen1/prime/loader/07_populate_prime_applications').execute();
    await require('./command/gen1/prime/loader/08_finalize_prime_applications').execute();
    await require('./command/gen1/prime/loader/09_transfer_prime_assets').execute();
    await require('./command/gen1/prime/loader/10_read_prime_applications').execute();

    await require('./command/gen1/prime/worker/00_compile_contracts').execute();
    await require('./command/gen1/prime/worker/01_update_prime_applications').execute();
    await require('./command/gen1/prime/worker/02_upgrade_prime_assets').execute();
    await require('./command/gen1/prime/worker/03_list_prime_assets').execute();
    await require('./command/gen1/prime/worker/04_unlist_prime_assets').execute();
    await require('./command/gen1/prime/worker/05_relist_prime_assets').execute();
    await require('./command/gen1/prime/worker/06_buy_prime_assets').execute();
    await require('./command/gen1/prime/worker/07_rename_prime_applications').execute();
    await require('./command/gen1/prime/worker/08_repaint_prime_applications').execute();
    await require('./command/gen1/prime/worker/09_describe_prime_applications').execute();
    await require('./command/gen1/prime/worker/10_mint_prime_applications').execute();
    await require('./command/gen1/prime/worker/11_withdraw_prime_applications').execute();
    await require('./command/gen1/prime/worker/12_optin_prime_applications').execute();
    await require('./command/gen1/prime/worker/13_optout_prime_applications').execute();
    await require('./command/gen1/prime/worker/14_read_prime_applications').execute();

})();