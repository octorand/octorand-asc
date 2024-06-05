require('dotenv').config();

exports.execute = async function () {

    console.log('gen1 prime setup resources');
    await require('./prime/00_create_prime_inputs').execute();

}
