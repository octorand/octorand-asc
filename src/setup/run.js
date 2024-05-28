require('dotenv').config();

(async () => {

    console.log('run setup commands');
    await require('./command/00_optin_gen1').execute();
    await require('./command/01_optin_gen2').execute();
    await require('./command/02_optin_player').execute();
    await require('./command/03_transfer_assets').execute();

})();