require('dotenv').config();

const chain = require('./../chain/index');

(async () => {
    try {
        let connection = await chain.get('DEVNET');

        let account = connection.baseClient.generateAccount();
        let passphrase = connection.baseClient.secretKeyToMnemonic(account.sk);

        console.log('Address: ' + account.addr);
        console.log('Secret: ' + passphrase);

    } catch (error) {
        console.log(error);
    }
})();