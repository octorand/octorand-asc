const algosdk = require("algosdk");
const util = require('util');

let baseClient = algosdk;
let algodClient = new algosdk.Algodv2('', process.env.ALGO_SERVER, '');
let indexerClient = new algosdk.Indexer('', process.env.ALGO_INDEXER, '');

let player1 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_1);
let player2 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_2);
let player3 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_3);
let player4 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_4);
let player5 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_5);
let player6 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_6);
let player7 = algosdk.mnemonicToSecretKey(process.env.PLAYER_MNEMONIC_7);

exports.get = async function () {
    return {
        baseClient: baseClient,
        algodClient: algodClient,
        indexerClient: indexerClient,
        player1: player1,
        player2: player2,
        player3: player3,
        player4: player4,
        player5: player5,
        player6: player6,
        player7: player7
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

exports.compile = async function (source, print) {
    let encoder = new util.TextEncoder();
    let programBytes = encoder.encode(source);
    let compileResponse = await algodClient.compile(programBytes).do();
    let compileResult = Buffer.from(compileResponse.result, "base64");
    let compiledBytes = new Uint8Array(compileResult);

    if (print) {
        console.log(compileResponse);
    }

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