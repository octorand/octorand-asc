require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('app/play/prediction/algo/setup.json'));

        let info = await connection.indexerClient.lookupApplications(setup['game_app']['app_id']).do();

        setup['game_app']['app_address'] = connection.baseClient.getApplicationAddress(Number(info['application']['id']));
        setup['game_app']['app_creator'] = info['application']['params']['creator'];

        let data = {
            app_master: null,
            app_manager: null,
            app_name: null,
            app_master_share: null,
            app_manager_share: null,
            app_volume: null,
            app_option_1: null,
            app_option_2: null,
            app_option_3: null,
            app_tickets_1: null,
            app_tickets_2: null,
            app_tickets_3: null,
            app_timer: null,
            app_status: null,
            app_manager_percentage: null,
            app_winner_percentage: null,
            app_winner: null
        };

        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let state = global[i];
            let key = Buffer.from(state.key, 'base64').toString('utf-8');
            let value = Buffer.from(state.value['bytes'], 'base64');

            switch (key) {
                case '01':
                    data.app_master = connection.baseClient.encodeAddress(value.subarray(0, 32));
                    data.app_manager = connection.baseClient.encodeAddress(value.subarray(32, 64));
                    data.app_name = value.subarray(64, 96).toString('utf-8').trim();
                    data.app_master_share = connection.baseClient.decodeUint64(value.subarray(96, 104));
                    data.app_manager_share = connection.baseClient.decodeUint64(value.subarray(104, 112));
                    data.app_volume = connection.baseClient.decodeUint64(value.subarray(112, 120));
                    break;
                case '02':
                    data.app_option_1 = value.subarray(0, 24).toString('utf-8').trim();
                    data.app_option_2 = value.subarray(24, 48).toString('utf-8').trim();
                    data.app_option_3 = value.subarray(48, 72).toString('utf-8').trim();
                    data.app_tickets_1 = connection.baseClient.decodeUint64(value.subarray(72, 80));
                    data.app_tickets_2 = connection.baseClient.decodeUint64(value.subarray(80, 88));
                    data.app_tickets_3 = connection.baseClient.decodeUint64(value.subarray(88, 96));
                    data.app_timer = connection.baseClient.decodeUint64(value.subarray(96, 104));
                    data.app_status = connection.baseClient.decodeUint64(value.subarray(104, 106));
                    data.app_manager_percentage = connection.baseClient.decodeUint64(value.subarray(106, 108));
                    data.app_winner_percentage = connection.baseClient.decodeUint64(value.subarray(108, 110));
                    data.app_winner = connection.baseClient.decodeUint64(value.subarray(110, 112));
                    break;
            }
        }

        setup['game_app']['state'] = data;

        fs.writeFileSync('app/play/prediction/algo/setup.json', JSON.stringify(setup, null, 4));

        console.log('read game');

    } catch (error) {
        console.log(error);
    }
}
