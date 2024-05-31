const algosdk = require("algosdk");

const chain = require('./index');

let baseClient = algosdk;
let algodClient = new algosdk.Algodv2('', process.env.DEVNET_ALGO_SERVER, '');
let indexerClient = new algosdk.Indexer('', process.env.DEVNET_ALGO_INDEXER, '');

exports.get = async function () {
    let admin = algosdk.mnemonicToSecretKey(process.env.DEVNET_ADMIN_MNEMONIC);
    let player = algosdk.mnemonicToSecretKey(process.env.DEVNET_PLAYER_MNEMONIC);
    let gen1 = algosdk.mnemonicToSecretKey(process.env.DEVNET_GEN1_MANAGER_MNEMONIC);
    let gen2 = algosdk.mnemonicToSecretKey(process.env.DEVNET_GEN2_MANAGER_MNEMONIC);

    return {
        baseClient: baseClient,
        algodClient: algodClient,
        indexerClient: indexerClient,
        admin: admin,
        player: player,
        gen1: gen1,
        gen2: gen2,
    }
}

exports.compile = async function (source) {
    let connection = await exports.get();
    return await chain.compile(connection.algodClient, source);
}

exports.execute = async function (composer) {
    let connection = await exports.get();
    return await chain.execute(connection.algodClient, composer);
}

exports.method = function (contract, name) {
    return chain.method(contract, name);
}

exports.bytes = function (value, length) {
    return chain.bytes(value, length);
}

exports.reference = function (prefix, value) {
    return chain.reference(prefix, value);
}

exports.pager = async function (callback, limit, key) {
    return await chain.pager(callback, limit, key);
}

exports.event = function (value) {
    return chain.event(value);
}