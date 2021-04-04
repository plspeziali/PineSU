const GitConnector = require("../connectors/gitConnector");
const Web3Connector = require("../connectors/web3Connector");
const {exec} = require('child_process');
var opener = require("opener");
var web3 = new Web3Connector();

module.exports = {

    connect: async () => {

        require('async').series([
            () => exec('cd dapp'),
            () => exec('npm run serve')
        ]);

    }

};