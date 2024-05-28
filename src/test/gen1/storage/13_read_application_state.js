require('dotenv').config();

const fs = require('fs');
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let config = JSON.parse(fs.readFileSync('src/test/config.json'));

        let storage = config['gen1']['contracts']['storage'];

        let state = {
            id: null,
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
            sales: null,
            mints: null,
            renames: null,
            repaints: null,
            price: null,
            seller: null,
            name: null,
            description: null,
        };

        let info = await connection.indexerClient.lookupApplications(storage['application_id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'P1':
                    state.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    state.prime_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    state.legacy_asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    state.parent_application_id = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    state.theme = connection.baseClient.decodeUint64(value.subarray(32, 34));
                    state.skin = connection.baseClient.decodeUint64(value.subarray(34, 36));
                    state.is_founder = connection.baseClient.decodeUint64(value.subarray(36, 37));
                    state.is_artifact = connection.baseClient.decodeUint64(value.subarray(37, 38));
                    state.is_pioneer = connection.baseClient.decodeUint64(value.subarray(38, 39));
                    state.is_explorer = connection.baseClient.decodeUint64(value.subarray(39, 40));
                    state.score = connection.baseClient.decodeUint64(value.subarray(40, 48));
                    state.sales = connection.baseClient.decodeUint64(value.subarray(48, 52));
                    state.mints = connection.baseClient.decodeUint64(value.subarray(52, 56));
                    state.renames = connection.baseClient.decodeUint64(value.subarray(56, 60));
                    state.repaints = connection.baseClient.decodeUint64(value.subarray(60, 64));
                    state.price = connection.baseClient.decodeUint64(value.subarray(64, 72));
                    state.seller = connection.baseClient.encodeAddress(value.subarray(72, 104));
                    state.name = value.subarray(104, 112).toString('utf-8').trim();
                    break;
                case 'P2':
                    state.description = value.subarray(0, 64).toString('utf-8').trim();
                    break;
            }
        }

        storage['state'] = state;

        config['gen1']['contracts']['storage'] = storage;
        fs.writeFileSync('src/test/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
