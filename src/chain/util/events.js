const algosdk = require("algosdk");

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