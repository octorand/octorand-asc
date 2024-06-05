require('dotenv').config();

const algosdk = require("algosdk");
const fs = require('fs');

(async () => {
    try {
        let indexer = new algosdk.Indexer('', process.env.DEVNET_ALGO_INDEXER, '');

        let account = 'C6YVRWGITEELY27AF5CWIDPWSAL3LLXNZNXEVTWRQLHIARTM53MJHYSGFE';

        let info = await indexer.lookupAccountByID(account).do();

        console.log(info);
        fs.writeFileSync('src/info.json', JSON.stringify(assets, null, 4));
    } catch (error) {
        console.log(error);
    }
})();