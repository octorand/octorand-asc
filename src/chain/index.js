const algosdk = require("algosdk");
const util = require('util');

let baseClient = algosdk;
let algodClient = new algosdk.Algodv2('', process.env.ALGO_SERVER, '');
let indexerClient = new algosdk.Indexer('', process.env.ALGO_INDEXER, '');

let admin = algosdk.mnemonicToSecretKey(process.env.ADMIN_MNEMONIC);
let player = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC);
let gen1 = algosdk.mnemonicToSecretKey(process.env.GEN1_MANAGER_MNEMONIC);
let gen2 = algosdk.mnemonicToSecretKey(process.env.GEN2_MANAGER_MNEMONIC);

exports.get = async function () {
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

exports.wait = async function (transactionId) {
    let response = await algodClient.status().do();
    let lastround = response["last-round"];

    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(transactionId).do();
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            break;
        }

        lastround++;

        await algodClient.statusAfterBlock(lastround).do();
    }
};

exports.compile = async function (source) {
    let encoder = new util.TextEncoder();
    let programBytes = encoder.encode(source);
    let compileResponse = await algodClient.compile(programBytes).do();
    let compileResult = Buffer.from(compileResponse.result, "base64");
    let compiledBytes = new Uint8Array(compileResult);

    return compiledBytes;
}

exports.execute = async function (composer) {
    let results = await composer.execute(algodClient, 10);
    let txId = results.txIDs[0];

    await exports.wait(txId);
    let information = await algodClient.pendingTransactionInformation(txId).do();

    return {
        results: results,
        information: information
    }
}

exports.method = function (contract, name) {
    return contract.methods.find((m) => { return m.name == name });
}

exports.bytes = function (value, length) {
    if (length) {
        return new Uint8Array(Buffer.from((value + ' '.repeat(length)).substring(0, length)));
    } else {
        return new Uint8Array(Buffer.from(value));
    }
}

exports.reference = function (prefix, value) {
    return new Uint8Array([...exports.bytes(prefix + '-'), ...baseClient.encodeUint64(value)])
}