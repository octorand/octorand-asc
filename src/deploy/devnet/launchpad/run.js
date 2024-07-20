require('dotenv').config();

exports.execute = async function () {

    await require('./guardians/run').execute();
    await require('./takos/run').execute();

}
