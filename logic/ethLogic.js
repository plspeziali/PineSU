var EthConnector = require('../connectors/ethConnector');
var ethConnector;

module.exports = {

    connect(w1,w2,k){
        ethConnector = new EthConnector('HTTP://127.0.0.1:7545',w1,w2,k);
    },

    addToTreeND(hash, mc, closed){
        var date = new Date()
        return module.exports.addToTree(hash, mc, closed, date);
    },

    addToTree(hash, mc, closed, date){
        var leaf = mc.addRegistrationD("SU of "+date, hash, date, closed);
        return mc.generateProof(leaf);
    },

    async registerMC(mc){
        var [oHash, cHash] = mc.getMCRoot();
        var hash;
        if(oHash != null){
            if(cHash != null){
                //console.log([oHash, cHash])
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

    async verifyHash(mc, root, oHash, cHash, transactionHash, w1){
        var BSPRoot = mc.getBSPRoot(root, oHash, cHash);
        if(BSPRoot != null){
            [result, owner] = await ethConnector.verifyHash(transactionHash, BSPRoot, w1);
            return [result, owner]
        }
        return [false,BSPRoot];
    },

    async validateProof(mc, leafHash, openProofTree, closedProofTree, transactionHash, w1){
        var checkOpen = checkProof(leafHash, openProofTree);
        var checkClosed = checkProof(leafHash, closedProofTree);
        if(checkOpen || checkClosed){
            var BSPRoot = mc.calculateHash([openProofTree.BSPRoot, closedProofTree.BSPRoot]);
            if(BSPRoot != null){
                [result, owner] = await ethConnector.verifyHash(transactionHash, BSPRoot, w1);
                return [result, owner]
            }
            return [false,BSPRoot];
        }
        return [false,""];
    }

}