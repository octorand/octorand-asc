const algosdk = require("algosdk");

exports.event = function (value) {
    let data = {
        code: value.subarray(0, 4).toString('utf-8').trim(),
        version: algosdk.decodeUint64(value.subarray(4, 12)),
        timestamp: algosdk.decodeUint64(value.subarray(12, 20)),
        prime: algosdk.decodeUint64(value.subarray(20, 28)),
        sender: algosdk.encodeAddress(value.subarray(28, 60))
    };

    switch (data.code) {
        case 'prby':
            data.name = 'prime_buy';
            data['seller'] = algosdk.encodeAddress(value.subarray(60, 92));
            data['price'] = algosdk.decodeUint64(value.subarray(92, 100));
            break;
        case 'prls':
            data.name = 'prime_list';
            data['price'] = algosdk.decodeUint64(value.subarray(60, 68));
            break;
        case 'prmt':
            data.name = 'prime_mint';
            data['amount'] = algosdk.decodeUint64(value.subarray(60, 68));
            break;
        case 'proi':
            data.name = 'prime_optin';
            data['asset_id'] = algosdk.decodeUint64(value.subarray(60, 68));
            break;
        case 'proo':
            data.name = 'prime_optout';
            data['asset_id'] = algosdk.decodeUint64(value.subarray(60, 68));
            break;
        case 'prrn':
            data['name'] = 'prime_rename';
            data['index'] = algosdk.decodeUint64(value.subarray(60, 68));
            data['value'] = algosdk.decodeUint64(value.subarray(68, 76));
            data['price'] = algosdk.decodeUint64(value.subarray(76, 84));
            break;
        case 'prrp':
            data.name = 'prime_repaint';
            data['theme'] = algosdk.decodeUint64(value.subarray(60, 68));
            data['skin'] = algosdk.decodeUint64(value.subarray(68, 76));
            data['price'] = algosdk.decodeUint64(value.subarray(76, 84));
            break;
        case 'prul':
            data.name = 'prime_unlist';
            break;
        case 'prug':
            data.name = 'prime_upgrade';
            break;
        case 'prwd':
            data.name = 'prime_withdraw';
            data['amount'] = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return data;
}