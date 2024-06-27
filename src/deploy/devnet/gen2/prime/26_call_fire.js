require('dotenv').config();

const fs = require('fs');
const devnet = require('./../../../../chain/devnet');
const helpers = require('./../../../../chain/util/helpers');

exports.execute = async function () {
    try {
        let connection = await devnet.get();
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let config = JSON.parse(fs.readFileSync('src/deploy/devnet/config.json'));

        let application = config['gen2']['contracts']['prime']['app'];

        if (!application['fire']) {
            let composer = new connection.baseClient.AtomicTransactionComposer();

            let buyContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/buy/contract.json')));
            let buyApplication = config['gen2']['contracts']['prime']['buy'];
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
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let claimContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/claim/contract.json')));
            let claimApplication = config['gen2']['contracts']['prime']['claim'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: claimApplication['application_id'],
                method: helpers.method(claimContract, 'fire'),
                methodArgs: [
                    101,
                    connection.player.addr,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let listContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/list/contract.json')));
            let listApplication = config['gen2']['contracts']['prime']['list'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: listApplication['application_id'],
                method: helpers.method(listContract, 'fire'),
                methodArgs: [
                    102,
                    connection.player.addr,
                    102,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let mintContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/mint/contract.json')));
            let mintApplication = config['gen2']['contracts']['prime']['mint'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: mintApplication['application_id'],
                method: helpers.method(mintContract, 'fire'),
                methodArgs: [
                    103,
                    connection.player.addr,
                    103,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let optinContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/optin/contract.json')));
            let optinApplication = config['gen2']['contracts']['prime']['optin'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: optinApplication['application_id'],
                method: helpers.method(optinContract, 'fire'),
                methodArgs: [
                    104,
                    connection.player.addr,
                    config['setup']['platform']['asset_id'],
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let optoutContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/optout/contract.json')));
            let optoutApplication = config['gen2']['contracts']['prime']['optout'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: optoutApplication['application_id'],
                method: helpers.method(optoutContract, 'fire'),
                methodArgs: [
                    105,
                    connection.player.addr,
                    config['setup']['platform']['asset_id'],
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let renameContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/rename/contract.json')));
            let renameApplication = config['gen2']['contracts']['prime']['rename'];
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
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let repaintContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/repaint/contract.json')));
            let repaintApplication = config['gen2']['contracts']['prime']['repaint'];
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
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let unlistContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/unlist/contract.json')));
            let unlistApplication = config['gen2']['contracts']['prime']['unlist'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: unlistApplication['application_id'],
                method: helpers.method(unlistContract, 'fire'),
                methodArgs: [
                    108,
                    connection.player.addr,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let upgradeContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/upgrade/contract.json')));
            let upgradeApplication = config['gen2']['contracts']['prime']['upgrade'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: upgradeApplication['application_id'],
                method: helpers.method(upgradeContract, 'fire'),
                methodArgs: [
                    109,
                    connection.player.addr,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            let withdrawContract = new connection.baseClient.ABIContract(JSON.parse(fs.readFileSync('src/build/devnet/gen2/prime/withdraw/contract.json')));
            let withdrawApplication = config['gen2']['contracts']['prime']['withdraw'];
            composer.addMethodCall({
                sender: sender,
                signer: signer,
                appID: withdrawApplication['application_id'],
                method: helpers.method(withdrawContract, 'fire'),
                methodArgs: [
                    110,
                    connection.player.addr,
                    110,
                    config['gen2']['contracts']['prime']['app']['application_id'],
                ],
                suggestedParams: {
                    ...params,
                    fee: 2000,
                    flatFee: true
                }
            });

            await devnet.execute(composer);

            application['fire'] = true;

            config['gen2']['contracts']['prime']['app'] = application;
            fs.writeFileSync('src/deploy/devnet/config.json', JSON.stringify(config, null, 4));

            console.log('called fire method');
        }
    } catch (error) {
        console.log(error);
    }
}
