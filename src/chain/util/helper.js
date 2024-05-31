const crypto = require('crypto');
const algosdk = require("algosdk");

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