const algosdk = require("algosdk");

const client = require('./util/client');

let baseClient = algosdk;
let algodClient = new algosdk.Algodv2('', process.env.MAINNET_ALGO_SERVER, '');
let indexerClient = new algosdk.Indexer('', process.env.MAINNET_ALGO_INDEXER, '');

exports.get = async function () {
    let admin = algosdk.mnemonicToSecretKey(process.env.MAINNET_ADMIN_MNEMONIC);
    let gen1 = algosdk.mnemonicToSecretKey(process.env.MAINNET_GEN1_MANAGER_MNEMONIC);
    let gen2 = algosdk.mnemonicToSecretKey(process.env.MAINNET_GEN2_MANAGER_MNEMONIC);
    let guardians = {
        manager: algosdk.mnemonicToSecretKey(process.env.MAINNET_LAUNCHPAD_GUARDIANS_MANAGER_MNEMONIC),
    };
    let takos = {
        manager: algosdk.mnemonicToSecretKey(process.env.MAINNET_LAUNCHPAD_TAKOS_MANAGER_MNEMONIC),
    };
    let legacy = algosdk.mnemonicToSecretKey(process.env.MAINNET_LEGACY_MNEMONIC);

    return {
        baseClient: baseClient,
        algodClient: algodClient,
        indexerClient: indexerClient,
        admin: admin,
        gen1: gen1,
        gen2: gen2,
        guardians: guardians,
        takos: takos,
        legacy: legacy,
    }
}

exports.compile = async function (source) {
    let connection = await exports.get();
    return await client.compile(connection.algodClient, source);
}

exports.execute = async function (composer) {
    let connection = await exports.get();
    return await client.execute(connection.algodClient, composer);
}