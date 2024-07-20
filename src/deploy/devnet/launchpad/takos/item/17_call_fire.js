require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');
const helpers = require('./../../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['launchpad']['takos']['contracts']['item']['app'];

        if (!application['fire']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            let buyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/buy/contract.json')));
            let buyApplication = config['launchpad']['takos']['contracts']['item']['buy'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: buyApplication['application_id'],
                method: helpers.method(buyContract, 'fire'),
                methodArgs: [
                    100,
                    connection.player.addr,
                    connection.admin.addr,
                    100,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let claimContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/claim/contract.json')));
            let claimApplication = config['launchpad']['takos']['contracts']['item']['claim'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: claimApplication['application_id'],
                method: helpers.method(claimContract, 'fire'),
                methodArgs: [
                    101,
                    connection.player.addr,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let listContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/list/contract.json')));
            let listApplication = config['launchpad']['takos']['contracts']['item']['list'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: listApplication['application_id'],
                method: helpers.method(listContract, 'fire'),
                methodArgs: [
                    102,
                    connection.player.addr,
                    102,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let mintContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/mint/contract.json')));
            let mintApplication = config['launchpad']['takos']['contracts']['item']['mint'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: mintApplication['application_id'],
                method: helpers.method(mintContract, 'fire'),
                methodArgs: [
                    103,
                    connection.player.addr,
                    103,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let renameContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/rename/contract.json')));
            let renameApplication = config['launchpad']['takos']['contracts']['item']['rename'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: renameApplication['application_id'],
                method: helpers.method(renameContract, 'fire'),
                methodArgs: [
                    104,
                    connection.player.addr,
                    helpers.bytes('104', 16),
                    104,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let unlistContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/takos/item/unlist/contract.json')));
            let unlistApplication = config['launchpad']['takos']['contracts']['item']['unlist'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: unlistApplication['application_id'],
                method: helpers.method(unlistContract, 'fire'),
                methodArgs: [
                    105,
                    connection.player.addr,
                    config['launchpad']['takos']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['fire'] = true;

            config['launchpad']['takos']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called fire method');
        }
    } catch (error) {
        console.log(error);
    }
}
