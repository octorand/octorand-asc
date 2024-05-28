require('dotenv').config();

const fs = require("fs");

(async () => {
    try {

        let source = 'src/build';
        let destination = '../octorand-web/src/app/contracts/';

        fs.cpSync(source, destination, { recursive: true });

    } catch (error) {
        console.log(error);
    }
})();