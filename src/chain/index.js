const crypto = require('crypto');
const algosdk = require("algosdk");
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
    return new Uint8Array([...exports.bytes(prefix + '-'), ...algosdk.encodeUint64(value)])
}

exports.pager = async function (callback, limit, key) {
    let entries = [];
    let pages = [];
    let hashes = [];

    let next = '';
    while (next !== undefined) {
        let response = await callback.limit(limit).nextToken(next).do();
        let data = response[key];
        next = response['next-token'];

        if (pages.includes(next)) {
            break;
        } else {
            pages.push(next);
        }

        if (data) {
            for (let i = 0; i < data.length; i++) {
                let entry = data[i];
                let hash = crypto.createHash('md5').update(JSON.stringify(entry)).digest("hex");

                if (!hashes.includes(hash)) {
                    entries.push(entry);
                    hashes.push(hash);
                }
            }
        }
    }

    return entries;
}

exports.event = function (value) {
    let data = {
        code: algosdk.decodeUint64(value.subarray(0, 8)),
        version: algosdk.decodeUint64(value.subarray(8, 16)),
        timestamp: algosdk.decodeUint64(value.subarray(16, 24)),
        prime: algosdk.decodeUint64(value.subarray(24, 32)),
        sender: algosdk.encodeAddress(value.subarray(32, 64))
    };

    switch (data.code) {
        case 100:
            data['name'] = 'design_rename';
            data['index'] = algosdk.decodeUint64(value.subarray(64, 72));
            data['value'] = algosdk.decodeUint64(value.subarray(72, 80));
            data['price'] = algosdk.decodeUint64(value.subarray(80, 88));
            break;
        case 101:
            data.name = 'design_repaint';
            data['theme'] = algosdk.decodeUint64(value.subarray(64, 72));
            data['skin'] = algosdk.decodeUint64(value.subarray(72, 80));
            data['price'] = algosdk.decodeUint64(value.subarray(80, 88));
            break;
        case 102:
            data.name = 'design_describe';
            data['description'] = value.subarray(64, 128).toString('utf-8').trim();
            data['price'] = algosdk.decodeUint64(value.subarray(128, 136));
            break;
        case 110:
            data.name = 'market_list';
            data['price'] = algosdk.decodeUint64(value.subarray(64, 72));
            break;
        case 111:
            data.name = 'market_unlist';
            break;
        case 112:
            data.name = 'market_buy';
            data['seller'] = algosdk.encodeAddress(value.subarray(64, 96));
            data['price'] = algosdk.decodeUint64(value.subarray(96, 104));
            break;
        case 120:
            data.name = 'vault_optin';
            data['asset_id'] = algosdk.decodeUint64(value.subarray(64, 72));
            break;
        case 121:
            data.name = 'vault_optout';
            data['asset_id'] = algosdk.decodeUint64(value.subarray(64, 72));
            break;
        case 130:
            data.name = 'wallet_upgrade';
            break;
        case 131:
            data.name = 'wallet_mint';
            data['amount'] = algosdk.decodeUint64(value.subarray(64, 72));
            break;
        case 132:
            data.name = 'wallet_withdraw';
            data['amount'] = algosdk.decodeUint64(value.subarray(64, 72));
            break;
    }

    return data;
}