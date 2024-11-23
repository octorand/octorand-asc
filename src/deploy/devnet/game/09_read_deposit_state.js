require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../chain/devnet');

exports.execute = async function () {
    try {
        let connection = await devnet.get();

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['game']['contracts']['deposit'];

        let state = {
            platform_asset_id: null,
            deposit_count: null,
            deposit_amount: null,
        };

        let info = await connection.indexerClient.lookupApplications(application['application_id']).do();
        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = Buffer.from(params.key, 'base64').toString('utf-8');
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 'P':
                    state.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    state.deposit_count = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    state.deposit_amount = connection.baseClient.decodeUint64(value.subarray(16, 24));
                    break;
            }
        }

        application['state'] = state;

        config['game']['contracts']['deposit'] = application;
        fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

    } catch (error) {
        console.log(error);
    }
}
