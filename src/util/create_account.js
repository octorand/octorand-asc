require('dotenv').config();

const chain = require('./../lib/chain');

(async () => {
    try {
        let connection = await chain.get();

        let account = connection.baseClient.generateAccount();
        let passphrase = connection.baseClient.secretKeyToMnemonic(account.sk);

        console.log('Address: ' + account.addr);
        console.log('Secret: ' + passphrase);

    } catch (error) {
        console.log(error);
    }
})();