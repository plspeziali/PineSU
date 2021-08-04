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
        var [oHash, cHash] = mc.getMCRoot();
        var hash;
        if(oHash != null){
            if(cHash != null){
                hash = mc.calculateHash([oHash, cHash]);
            } else {
                hash = oHash;
            }
        }
        if(cHash != null && oHash == null){
            hash = cHash;
        }
        var transactionHash = await ethConnector.deploy(hash);
        return [oHash, cHash, transactionHash];
    },

    async verifyHash(mc, root, oHash, cHash, transactionHash){
        var BSPRoot = mc.getBSPRoot(root, oHash, cHash);
        if(BSPRoot != null){
            return await ethConnector.verifyHash(transactionHash, BSPRoot);
        }
        return false;
    }

}