require('dotenv').config();

(async () => {

    let environment = "DEVNET";

    await require('./setup/run').execute(environment);
    // await require('./gen1/run').execute();
    // await require('./gen2/run').execute();

})();