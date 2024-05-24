require('dotenv').config();

(async () => {

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

    // await require('./command/gen1/prime/worker/00_compile_contracts').execute();



    // await require('./command/prime/02_create_legacy_assets').execute();
    // await require('./command/prime/03_create_prime_assets').execute();
    // await require('./command/prime/04_create_prime_applications').execute();
    // await require('./command/prime/05_fund_prime_applications').execute();
    // await require('./command/prime/06_update_prime_applications').execute();
    // await require('./command/prime/07_initialize_prime_applications').execute();
    // await require('./command/prime/08_populate_prime_applications').execute();
    // await require('./command/prime/09_finalize_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/11_transfer_prime_assets').execute();
    // await require('./command/prime/12_upgrade_prime_assets').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/13_list_prime_assets').execute();
    // await require('./command/prime/14_unlist_prime_assets').execute();
    // await require('./command/prime/15_relist_prime_assets').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/16_buy_prime_assets').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/17_rename_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/18_repaint_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/19_describe_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/20_mint_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/21_withdraw_prime_applications').execute();
    // await require('./command/prime/10_read_prime_applications').execute();
    // await require('./command/prime/22_optin_prime_applications').execute();
    // await require('./command/prime/23_optout_prime_applications').execute();

})();