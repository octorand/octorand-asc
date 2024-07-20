require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['launchpad']['takos']['contracts']['item']['app'];

        let state = {
            id: null,
            platform_asset_id: null,
            item_asset_id: null,
            price: null,
            seller: null,
            name: null,
            owner: null,
            rewards: null,
        };

        let info = await connection.indexerClient.lookupApplications(application['application_id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'P':
                    state.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    state.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    state.item_asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    state.rewards = connection.baseClient.decodeUint64(value.subarray(24, 32));
                    state.price = connection.baseClient.decodeUint64(value.subarray(32, 40));
                    state.seller = connection.baseClient.encodeAddress(value.subarray(40, 72));
                    state.owner = connection.baseClient.encodeAddress(value.subarray(72, 104));
                    state.name = value.subarray(104, 120).toString('utf-8').trim();
                    break;
            }
        }

        application['state'] = state;

        config['launchpad']['takos']['contracts']['item']['app'] = application;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
