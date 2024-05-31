const crypto = require('crypto');
const algosdk = require("algosdk");
const util = require('util');

let baseClient = algosdk;
let algodClient = null;
let indexerClient = null;

exports.devnet = async function () {
    return exports.get('DEVNET');
}

exports.testnet = async function () {
    return exports.get('TESTNET');
}

exports.mainnet = async function () {
    return exports.get('MAINNET');
}

exports.get = async function (environment) {

    algodClient = new algosdk.Algodv2('', process.env[environment + '_ALGO_SERVER'], '');
    indexerClient = new algosdk.Indexer('', process.env[environment + '_ALGO_INDEXER'], '');

    let admin = algosdk.mnemonicToSecretKey(process.env[environment + '_ADMIN_MNEMONIC']);
    let player = algosdk.mnemonicToSecretKey(process.env[environment + '_PLAYER_MNEMONIC']);
    let gen1 = algosdk.mnemonicToSecretKey(process.env[environment + '_GEN1_MANAGER_MNEMONIC']);
    let gen2 = algosdk.mnemonicToSecretKey(process.env[environment + '_GEN2_MANAGER_MNEMONIC']);

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
        code: baseClient.decodeUint64(value.subarray(0, 8)),
        version: baseClient.decodeUint64(value.subarray(8, 16)),
        timestamp: baseClient.decodeUint64(value.subarray(16, 24)),
        prime: baseClient.decodeUint64(value.subarray(24, 32)),
        sender: baseClient.encodeAddress(value.subarray(32, 64))
    };

    switch (data.code) {
        case 100:
            data['name'] = 'design_rename';
            data['index'] = baseClient.decodeUint64(value.subarray(64, 72));
            data['value'] = baseClient.decodeUint64(value.subarray(72, 80));
            data['price'] = baseClient.decodeUint64(value.subarray(80, 88));
            break;
        case 101:
            data.name = 'design_repaint';
            data['theme'] = baseClient.decodeUint64(value.subarray(64, 72));
            data['skin'] = baseClient.decodeUint64(value.subarray(72, 80));
            data['price'] = baseClient.decodeUint64(value.subarray(80, 88));
            break;
        case 102:
            data.name = 'design_describe';
            data['description'] = value.subarray(64, 128).toString('utf-8').trim();
            data['price'] = baseClient.decodeUint64(value.subarray(128, 136));
            break;
        case 110:
            data.name = 'market_list';
            data['price'] = baseClient.decodeUint64(value.subarray(64, 72));
            break;
        case 111:
            data.name = 'market_unlist';
            break;
        case 112:
            data.name = 'market_buy';
            data['seller'] = baseClient.encodeAddress(value.subarray(64, 96));
            data['price'] = baseClient.decodeUint64(value.subarray(96, 104));
            break;
        case 120:
            data.name = 'vault_optin';
            data['asset_id'] = baseClient.decodeUint64(value.subarray(64, 72));
            break;
        case 121:
            data.name = 'vault_optout';
            data['asset_id'] = baseClient.decodeUint64(value.subarray(64, 72));
            break;
        case 130:
            data.name = 'wallet_upgrade';
            break;
        case 131:
            data.name = 'wallet_mint';
            data['amount'] = baseClient.decodeUint64(value.subarray(64, 72));
            break;
        case 132:
            data.name = 'wallet_withdraw';
            data['amount'] = baseClient.decodeUint64(value.subarray(64, 72));
            break;
    }

    return data;
}