require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['gen1']['contracts']['prime']['app'];

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
            sales: null,
            drains: null,
            transforms: null,
            vaults: null,
            name: null,
            owner: null,
            rewards: null,
            royalties: null,
        };

        let info = await connection.indexerClient.lookupApplications(application['application_id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'P1':
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
                    state.sales = connection.baseClient.decodeUint64(value.subarray(96, 98));
                    state.drains = connection.baseClient.decodeUint64(value.subarray(98, 100));
                    state.transforms = connection.baseClient.decodeUint64(value.subarray(100, 102));
                    state.vaults = connection.baseClient.decodeUint64(value.subarray(102, 104));
                    state.name = value.subarray(104, 112).toString('utf-8').trim();
                    break;
                case 'P2':
                    state.owner = connection.baseClient.encodeAddress(value.subarray(0, 32));
                    state.rewards = connection.baseClient.decodeUint64(value.subarray(32, 40));
                    state.royalties = connection.baseClient.decodeUint64(value.subarray(40, 48));
                    break;
            }
        }

        application['state'] = state;

        config['gen1']['contracts']['prime']['app'] = application;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
