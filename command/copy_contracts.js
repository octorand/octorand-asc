require('dotenv').config();

const fs = require("fs");

(async () => {
    try {

        let sources = [
            ['app/play', 'lottery/algo/build'],
            ['app/play', 'prediction/algo/build'],
        ];

        for (let i = 0; i < sources.length; i++) {
            let source = sources[i].join('/');
            let destinationGen = '../octorand-gen/' + sources[i].join('/contracts/');
            let destinationWeb = '../octorand-web/src/' + sources[i].join('/contracts/');

            fs.cpSync(source, destinationGen, { recursive: true });
            fs.cpSync(source, destinationWeb, { recursive: true });
        }

    } catch (error) {
        console.log(error);
    }
})();