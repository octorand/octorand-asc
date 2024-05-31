const util = require('util');

exports.wait = async function (client, transactionId) {
    let response = await client.status().do();
    let lastround = response["last-round"];

    while (true) {
        const pendingInfo = await client.pendingTransactionInformation(transactionId).do();
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            break;
        }

        lastround++;

        await client.statusAfterBlock(lastround).do();
    }
};

exports.compile = async function (client, source) {
    let encoder = new util.TextEncoder();
    let programBytes = encoder.encode(source);
    let compileResponse = await client.compile(programBytes).do();
    let compileResult = Buffer.from(compileResponse.result, "base64");
    let compiledBytes = new Uint8Array(compileResult);

    return compiledBytes;
}

exports.execute = async function (client, composer) {
    let results = await composer.execute(client, 10);
    let txId = results.txIDs[0];

    await exports.wait(client, txId);
    let information = await client.pendingTransactionInformation(txId).do();

    return {
        results: results,
        information: information
    }
}