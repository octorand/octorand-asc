require('dotenv').config();

const chain = require('./../../chain/index');

exports.execute = async function () {
    try {

        let connection = await chain.get('DEVNET');
        let params = await connection.algodClient.getTransactionParams().do();
        let sender = connection.admin.addr;
        let signer = connection.baseClient.makeBasicAccountTransactionSigner(connection.admin);

        let composer = new connection.baseClient.AtomicTransactionComposer();

        composer.addTransaction({
            signer: signer,
            txn: connection.baseClient.makeAssetConfigTxnWithSuggestedParamsFromObject({
                from: sender,
                assetIndex: Number(process.env.PLATFORM_ASSET_ID),
                manager: sender,
                reserve: process.env.PLATFORM_ASSET_RESERVE,
                strictEmptyAddressChecking: false,
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true
                }
            })
        });

        await chain.execute(composer);

        console.log('Updated platform asset');

    } catch (error) {
        console.log(error);
    }
}