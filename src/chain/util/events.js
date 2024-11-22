const algosdk = require("algosdk");

exports.event = function (log) {
    let value = Buffer.from(log, 'base64');

    let data = {
        code: value.subarray(0, 4).toString('utf-8').trim(),
        version: algosdk.decodeUint64(value.subarray(4, 12)),
        timestamp: algosdk.decodeUint64(value.subarray(12, 20)),
        params: null
    };

    switch (data.code) {
        case 'prby':
            data.params = exports.decodePrimeBuyParams(data.version, value);
            break;
        case 'prcl':
            data.params = exports.decodePrimeClaimParams(data.version, value);
            break;
        case 'prls':
            data.params = exports.decodePrimeListParams(data.version, value);
            break;
        case 'prmt':
            data.params = exports.decodePrimeMintParams(data.version, value);
            break;
        case 'proi':
            data.params = exports.decodePrimeOptinParams(data.version, value);
            break;
        case 'proo':
            data.params = exports.decodePrimeOptoutParams(data.version, value);
            break;
        case 'prrn':
            data.params = exports.decodePrimeRenameParams(data.version, value);
            break;
        case 'prrp':
            data.params = exports.decodePrimeRepaintParams(data.version, value);
            break;
        case 'prul':
            data.params = exports.decodePrimeUnlistParams(data.version, value);
            break;
        case 'prug':
            data.params = exports.decodePrimeUpgradeParams(data.version, value);
            break;
        case 'prwd':
            data.params = exports.decodePrimeWithdrawParams(data.version, value);
            break;
        case 'imby':
            data.params = exports.decodeItemBuyParams(data.version, value);
            break;
        case 'imcl':
            data.params = exports.decodeItemClaimParams(data.version, value);
            break;
        case 'imls':
            data.params = exports.decodeItemListParams(data.version, value);
            break;
        case 'immt':
            data.params = exports.decodeItemMintParams(data.version, value);
            break;
        case 'imrn':
            data.params = exports.decodeItemRenameParams(data.version, value);
            break;
        case 'imul':
            data.params = exports.decodeItemUnlistParams(data.version, value);
            break;
        case 'gmat':
            data.params = exports.decodeGameAuthParams(data.version, value);
            break;
        case 'gmdp':
            data.params = exports.decodeGameDepositParams(data.version, value);
            break;
    }

    return data;
}

exports.decodePrimeBuyParams = function (version, value) {
    let params = {
        name: 'prime_buy',
        prime: null,
        sender: null,
        seller: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.seller = algosdk.encodeAddress(value.subarray(60, 92));
            params.price = algosdk.decodeUint64(value.subarray(92, 100));
            break;
    }

    return params;
}

exports.decodePrimeClaimParams = function (version, value) {
    let params = {
        name: 'prime_claim',
        prime: null,
        sender: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            break;
    }

    return params;
}

exports.decodePrimeListParams = function (version, value) {
    let params = {
        name: 'prime_list',
        prime: null,
        sender: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.price = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodePrimeMintParams = function (version, value) {
    let params = {
        name: 'prime_mint',
        prime: null,
        sender: null,
        amount: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.amount = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodePrimeOptinParams = function (version, value) {
    let params = {
        name: 'prime_optin',
        prime: null,
        sender: null,
        asset_id: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.asset_id = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodePrimeOptoutParams = function (version, value) {
    let params = {
        name: 'prime_optout',
        prime: null,
        sender: null,
        asset_id: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.asset_id = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodePrimeRenameParams = function (version, value) {
    let params = {
        name: 'prime_rename',
        prime: null,
        sender: null,
        index: null,
        value: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.index = algosdk.decodeUint64(value.subarray(60, 68));
            params.value = algosdk.decodeUint64(value.subarray(68, 76));
            params.price = algosdk.decodeUint64(value.subarray(76, 84));
            break;
    }

    return params;
}

exports.decodePrimeRepaintParams = function (version, value) {
    let params = {
        name: 'prime_repaint',
        prime: null,
        sender: null,
        theme: null,
        skin: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.theme = algosdk.decodeUint64(value.subarray(60, 68));
            params.skin = algosdk.decodeUint64(value.subarray(68, 76));
            params.price = algosdk.decodeUint64(value.subarray(76, 84));
            break;
    }

    return params;
}

exports.decodePrimeUnlistParams = function (version, value) {
    let params = {
        name: 'prime_unlist',
        prime: null,
        sender: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            break;
    }

    return params;
}

exports.decodePrimeUpgradeParams = function (version, value) {
    let params = {
        name: 'prime_upgrade',
        prime: null,
        sender: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            break;
    }

    return params;
}

exports.decodePrimeWithdrawParams = function (version, value) {
    let params = {
        name: 'prime_withdraw',
        prime: null,
        sender: null,
        amount: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.prime = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.amount = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodeItemBuyParams = function (version, value) {
    let params = {
        name: 'item_buy',
        item: null,
        sender: null,
        seller: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.seller = algosdk.encodeAddress(value.subarray(60, 92));
            params.price = algosdk.decodeUint64(value.subarray(92, 100));
            break;
    }

    return params;
}

exports.decodeItemClaimParams = function (version, value) {
    let params = {
        name: 'item_claim',
        item: null,
        sender: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            break;
    }

    return params;
}

exports.decodeItemListParams = function (version, value) {
    let params = {
        name: 'item_list',
        item: null,
        sender: null,
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.price = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodeItemMintParams = function (version, value) {
    let params = {
        name: 'item_mint',
        item: null,
        sender: null,
        amount: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.amount = algosdk.decodeUint64(value.subarray(60, 68));
            break;
    }

    return params;
}

exports.decodeItemRenameParams = function (version, value) {
    let params = {
        name: 'item_rename',
        item: null,
        sender: null,
        value: '',
        price: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            params.value = value.subarray(60, 76).toString('utf-8').trim();
            params.price = algosdk.decodeUint64(value.subarray(76, 84));
            break;
    }

    return params;
}

exports.decodeItemUnlistParams = function (version, value) {
    let params = {
        name: 'item_unlist',
        item: null,
        sender: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.item = algosdk.decodeUint64(value.subarray(20, 28));
            params.sender = algosdk.encodeAddress(value.subarray(28, 60));
            break;
    }

    return params;
}

exports.decodeGameAuthParams = function (version, value) {
    let params = {
        name: 'game_auth',
        sender: null,
        key: '',
    };

    switch (version) {
        case 0:
        case 1:
            params.sender = algosdk.encodeAddress(value.subarray(20, 52));
            params.key = value.subarray(52, 100).toString('utf-8').trim();
            break;
    }

    return params;
}

exports.decodeGameDepositParams = function (version, value) {
    let params = {
        name: 'game_deposit',
        sender: null,
        amount: null,
    };

    switch (version) {
        case 0:
        case 1:
            params.sender = algosdk.encodeAddress(value.subarray(20, 52));
            params.amount = algosdk.decodeUint64(value.subarray(52, 60));
            break;
    }

    return params;
}