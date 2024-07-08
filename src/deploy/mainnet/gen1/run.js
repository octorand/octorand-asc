require('dotenv').config();

exports.execute = async function () {

    console.log('gen1 prime setup resources');
    await require('./prime/00_create_prime_inputs').execute();
    await require('./prime/01_create_prime_assets').execute();
    await require('./prime/02_update_prime_assets').execute();

    console.log('gen1 prime setup contracts');
    await require('./prime/03_create_sub_applications').execute();
    await require('./prime/04_update_sub_applications').execute();
    await require('./prime/05_create_main_applications').execute();
    await require('./prime/06_update_main_applications').execute();
    await require('./prime/07_lock_main_applications').execute();
    await require('./prime/08_update_legacy_applications').execute();
    await require('./prime/09_move_legacy_vaults').execute();
    await require('./prime/10_move_legacy_listings').execute();
    await require('./prime/11_move_legacy_rewards').execute();
    await require('./prime/12_fire_legacy_buys').execute();
    await require('./prime/13_delete_legacy_applications').execute();

    console.log('gen1 prime setup graphics');
    let graphic = true;
    if (graphic) {
        await require('./prime/14_update_graphic_parameters').execute();
        await require('./prime/15_update_graphic_svgs').execute();
    }
}
