const algosdk = require("algosdk");

const client = require('./util/client');

let baseClient = algosdk;
let algodClient = new algosdk.Algodv2('', process.env.DEVNET_ALGO_SERVER, '');
let indexerClient = new algosdk.Indexer('', process.env.DEVNET_ALGO_INDEXER, '');

exports.get = async function () {
    let admin = algosdk.mnemonicToSecretKey(process.env.DEVNET_ADMIN_MNEMONIC);
    let player = algosdk.mnemonicToSecretKey(process.env.DEVNET_PLAYER_MNEMONIC);
    let gen1 = algosdk.mnemonicToSecretKey(process.env.DEVNET_GEN1_MANAGER_MNEMONIC);
    let gen2 = algosdk.mnemonicToSecretKey(process.env.DEVNET_GEN2_MANAGER_MNEMONIC);
    let guardians = {
        manager: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_GUARDIANS_MANAGER_MNEMONIC),
        artist: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_GUARDIANS_ARTIST_MNEMONIC),
        treasury: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_GUARDIANS_TREASURY_MNEMONIC)
    };
    let takos = {
        manager: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_TAKOS_MANAGER_MNEMONIC),
        artist: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_TAKOS_ARTIST_MNEMONIC),
        treasury: algosdk.mnemonicToSecretKey(process.env.DEVNET_LAUNCHPAD_TAKOS_TREASURY_MNEMONIC)
    };

    return {
        baseClient: baseClient,
        algodClient: algodClient,
        indexerClient: indexerClient,
        admin: admin,
        player: player,
        gen1: gen1,
        gen2: gen2,
        guardians: guardians,
        takos: takos,
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