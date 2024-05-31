require('dotenv').config();

const algosdk = require("algosdk");

(async () => {
    try {
        let account = algosdk.generateAccount();
        let passphrase = algosdk.secretKeyToMnemonic(account.sk);

        console.log('Address: ' + account.addr);
        console.log('Secret: ' + passphrase);

    } catch (error) {
        console.log(error);
    }
})();