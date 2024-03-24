require('dotenv').config();

(async () => {
    await require('./command/01_create_platform_asset').execute();
})();