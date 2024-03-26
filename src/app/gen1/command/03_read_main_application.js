require('dotenv').config();

const fs = require("fs");
const chain = require('./../../../chain/index');

exports.execute = async function () {
    try {
        let connection = await chain.get();

        let setup = JSON.parse(fs.readFileSync('src/app/gen1/setup.json'));

        let info = await connection.indexerClient.lookupApplications(setup['main_application_id']).do();

        let data = {
            address: connection.baseClient.getApplicationAddress(Number(info['application']['id'])),
            creator: info['application']['params']['creator']
        };

        setup['main_application_address'] = data.address;
        setup['main_application_creator'] = data.creator;

        let state = {
            primes_count: null,
            platform_asset_id: null,
            platform_asset_reserve: null,
        };

        let global = info['application']['params']['global-state'];

        for (let i = 0; i < global.length; i++) {
            let params = global[i];
            let key = connection.baseClient.decodeUint64(Buffer.from(params.key, 'base64'));
            let value = Buffer.from(params.value['bytes'], 'base64');

            switch (key) {
                case 1:
                    state.primes_count = connection.baseClient.decodeUint64(value.subarray(0, 8));
                    state.platform_asset_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                    state.platform_asset_reserve = connection.baseClient.encodeAddress(value.subarray(16, 48));
                    break;
            }
        }

        setup['state'] = state;

        let primes = [];
        for (let i = 0; i < state.primes_count; i++) {
            let prime = {
                id: null,
                application_id: null,
                asset_id: null
            };

            let primeInfo = await connection.indexerClient.lookupApplicationBoxByIDandName(setup['main_application_id'], connection.baseClient.encodeUint64(i)).do();
            let value = primeInfo.value;

            prime.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
            prime.application_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
            prime.asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));

            let primeState = {
                id: null,
                application_id: null,
                asset_id: null
            };

            let primeGlobalInfo = await connection.indexerClient.lookupApplications(prime.application_id).do();
            let primeGlobal = primeGlobalInfo['application']['params']['global-state'];

            for (let i = 0; i < primeGlobal.length; i++) {
                let params = primeGlobal[i];
                let key = connection.baseClient.decodeUint64(Buffer.from(params.key, 'base64'));
                let value = Buffer.from(params.value['bytes'], 'base64');

                switch (key) {
                    case 1:
                        primeState.id = connection.baseClient.decodeUint64(value.subarray(0, 8));
                        primeState.application_id = connection.baseClient.decodeUint64(value.subarray(8, 16));
                        primeState.asset_id = connection.baseClient.decodeUint64(value.subarray(16, 24));
                        break;
                }
            }

            prime['state'] = primeState;

            primes.push(prime);
        }

        setup['primes'] = primes;

        fs.writeFileSync('src/app/gen1/setup.json', JSON.stringify(setup, null, 4));

        console.log('read main application');

    } catch (error) {
        console.log(error);
    }
}
