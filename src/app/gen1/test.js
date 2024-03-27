require('dotenv').config();

(async () => {
    await require('./command/01_create_saver_app').execute();
    await require('./command/02_create_main_app').execute();
})();