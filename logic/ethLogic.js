var EthConnector = require('../connectors/ethConnector');
var ethConnector;

module.exports = {

    connect(w1,w2,k){
        ethConnector = new EthConnector('HTTP://127.0.0.1:7545',w1,w2,k);
    },

    addToTree(hash, mc, closed){
        var date = new Date()
        mc.addRegistrationD("SU of "+date, hash, date, closed);
    },

    async registerMC(mc){
        var hash = mc.getMCRoot();
        var transactionHash = await ethConnector.deploy(hash);
        return transactionHash;
    },

    async verifyHash(mc, hash, transactionHash){
        var BSPRoot = mc.getBSPRoot(hash);
        if(BSPRoot != null){
            return await ethConnector.verifyHash(transactionHash, BSPRoot);
        }
        return false;
    }

}