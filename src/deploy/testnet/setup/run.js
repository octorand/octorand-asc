require('dotenv').config();

exports.execute = async function () {

    console.log('setup asset requirements');
    await require('./asset/00_create_platform_asset').execute();

}
