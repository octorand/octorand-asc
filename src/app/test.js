require('dotenv').config();

(async () => {

    await require('./command/gen1/design/00_compile_contract').execute();
    await require('./command/gen1/design/01_create_application').execute();

    await require('./command/gen1/market/00_compile_contract').execute();
    await require('./command/gen1/market/01_create_application').execute();

    await require('./command/gen1/vault/00_compile_contract').execute();
    await require('./command/gen1/vault/01_create_application').execute();

    await require('./command/gen1/wallet/00_compile_contract').execute();
    await require('./command/gen1/wallet/01_create_application').execute();

    await require('./command/gen1/storage/00_compile_contract').execute();
    await require('./command/gen1/storage/01_setup_prime_input').execute();
    await require('./command/gen1/storage/02_create_legacy_asset').execute();
    await require('./command/gen1/storage/03_create_prime_asset').execute();
    await require('./command/gen1/storage/04_create_application').execute();
    await require('./command/gen1/storage/05_fund_application').execute();
    await require('./command/gen1/storage/06_initialize_application').execute();
    await require('./command/gen1/storage/07_populate_application').execute();
    await require('./command/gen1/storage/08_finalize_application').execute();
    await require('./command/gen1/storage/09_transfer_assets').execute();
    await require('./command/gen1/storage/10_lock_prime_asset').execute();


})();