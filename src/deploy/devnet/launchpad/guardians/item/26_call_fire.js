require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['launchpad']['guardians']['contracts']['item']['app'];

        if (!application['fire']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            let buyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/buy/contract.json')));
            let buyApplication = config['launchpad']['guardians']['contracts']['item']['buy'];
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
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let claimContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/claim/contract.json')));
            let claimApplication = config['launchpad']['guardians']['contracts']['item']['claim'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: claimApplication['application_id'],
                method: helpers.method(claimContract, 'fire'),
                methodArgs: [
                    101,
                    connection.player.addr,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let listContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/list/contract.json')));
            let listApplication = config['launchpad']['guardians']['contracts']['item']['list'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: listApplication['application_id'],
                method: helpers.method(listContract, 'fire'),
                methodArgs: [
                    102,
                    connection.player.addr,
                    102,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let mintContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/mint/contract.json')));
            let mintApplication = config['launchpad']['guardians']['contracts']['item']['mint'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: mintApplication['application_id'],
                method: helpers.method(mintContract, 'fire'),
                methodArgs: [
                    103,
                    connection.player.addr,
                    103,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let optinContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/optin/contract.json')));
            let optinApplication = config['launchpad']['guardians']['contracts']['item']['optin'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: optinApplication['application_id'],
                method: helpers.method(optinContract, 'fire'),
                methodArgs: [
                    104,
                    connection.player.addr,
                    config['setup']['guardians']['asset_id'],
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let optoutContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/optout/contract.json')));
            let optoutApplication = config['launchpad']['guardians']['contracts']['item']['optout'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: optoutApplication['application_id'],
                method: helpers.method(optoutContract, 'fire'),
                methodArgs: [
                    105,
                    connection.player.addr,
                    config['setup']['guardians']['asset_id'],
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let renameContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/rename/contract.json')));
            let renameApplication = config['launchpad']['guardians']['contracts']['item']['rename'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: renameApplication['application_id'],
                method: helpers.method(renameContract, 'fire'),
                methodArgs: [
                    106,
                    connection.player.addr,
                    106,
                    106,
                    106,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let repaintContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/repaint/contract.json')));
            let repaintApplication = config['launchpad']['guardians']['contracts']['item']['repaint'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: repaintApplication['application_id'],
                method: helpers.method(repaintContract, 'fire'),
                methodArgs: [
                    107,
                    connection.player.addr,
                    107,
                    107,
                    107,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let unlistContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/unlist/contract.json')));
            let unlistApplication = config['launchpad']['guardians']['contracts']['item']['unlist'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: unlistApplication['application_id'],
                method: helpers.method(unlistContract, 'fire'),
                methodArgs: [
                    108,
                    connection.player.addr,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let upgradeContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/upgrade/contract.json')));
            let upgradeApplication = config['launchpad']['guardians']['contracts']['item']['upgrade'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: upgradeApplication['application_id'],
                method: helpers.method(upgradeContract, 'fire'),
                methodArgs: [
                    109,
                    connection.player.addr,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let withdrawContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/launchpad/guardians/item/withdraw/contract.json')));
            let withdrawApplication = config['launchpad']['guardians']['contracts']['item']['withdraw'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: withdrawApplication['application_id'],
                method: helpers.method(withdrawContract, 'fire'),
                methodArgs: [
                    110,
                    connection.player.addr,
                    110,
                    config['launchpad']['guardians']['contracts']['item']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['fire'] = true;

            config['launchpad']['guardians']['contracts']['item']['app'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called fire method');
        }
    } catch (error) {
        console.log(error);
    }
}
