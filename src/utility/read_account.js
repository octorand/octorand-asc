require('dotenv').config();

const algosdk = require("algosdk");

(async () => {
    try {
        let server = process.env.TESTNET_ALGO_INDEXER;
        let account = '';

        let indexer = new algosdk.Indexer('', server, '');

        let info = await indexer.lookupAccountByID(account).do();
        console.log(info);
    } catch (error) {
        console.log(error);
    }
})();