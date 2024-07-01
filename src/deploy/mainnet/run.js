require('dotenv').config();

(async () => {

    await require('./setup/run').execute();
    await require('./gen1/run').execute();
    await require('./gen2/run').execute();

})();