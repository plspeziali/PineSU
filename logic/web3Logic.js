const GitConnector = require("../connectors/gitConnector");
const Web3Connector = require("../connectors/web3Connector");
var web3 = new Web3Connector();

module.exports = {

    connect: async () => {

        await web3.createConnection();
        web3.createContract("0x0403ad51e9936E13409d00A26B543cC1fD883fc9");

    }

};