require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let storage = config['gen2']['contracts']['storage'];

        let state = {
            id: null,
            platform_asset_id: null,
            prime_asset_id: null,
            legacy_asset_id: null,
            parent_application_id: null,
            theme: null,
            skin: null,
            is_founder: null,
            is_artifact: null,
            is_pioneer: null,
            is_explorer: null,
            score: null,
            price: null,
            seller: null,
            name: null,
        };

        let info = await connection.indexerClient.lookupApplications(storage['application_id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'Prime':
                    state.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    state.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    state.prime_asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    state.legacy_asset_id = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    state.parent_application_id = connection.baseClient.decodeUint64(value.subarray(32, 40));
                    state.theme = connection.baseClient.decodeUint64(value.subarray(40, 42));
                    state.skin = connection.baseClient.decodeUint64(value.subarray(42, 44));
                    state.is_founder = connection.baseClient.decodeUint64(value.subarray(44, 45));
                    state.is_artifact = connection.baseClient.decodeUint64(value.subarray(45, 46));
                    state.is_pioneer = connection.baseClient.decodeUint64(value.subarray(46, 47));
                    state.is_explorer = connection.baseClient.decodeUint64(value.subarray(47, 48));
                    state.score = connection.baseClient.decodeUint64(value.subarray(48, 56));
                    state.price = connection.baseClient.decodeUint64(value.subarray(56, 64));
                    state.seller = connection.baseClient.encodeAddress(value.subarray(64, 96));
                    state.name = value.subarray(96, 112).toString('utf-8').trim();
                    break;
            }
        }

        storage['state'] = state;

        config['gen2']['contracts']['storage'] = storage;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
