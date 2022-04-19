const EthConnector = require('../connectors/ethConnector');
const {v4: uuidv4} = require("uuid");
let ethConnector;

module.exports = {

    connect(w1, w2, k, h) {
        ethConnector = new EthConnector(h, w1, w2, k);
    },

    addToTreeND(hash, mc, closed) {
        const date = new Date();
        return module.exports.addToTree(hash, mc, closed, date);
    },

    addToTree(hash, mc, closed, date) {
        const uuid = uuidv4();
        const leaf = mc.addRegistrationD(uuid, hash, date, closed);
        return mc.generateProof(leaf);
    },

    async registerMC(mc) {
        let [oHash, cHash] = mc.getMCRoot();
        let hash;
        if (oHash != null) {
            if (cHash != null) {
                //console.log([oHash, cHash])
                hash = mc.calculateHash([oHash, cHash]);
            } else {
                hash = oHash;
            }
        }
        if (cHash != null && oHash == null) {
            hash = cHash;
        }
        const transactionHash = await ethConnector.deploy(hash);
        return [oHash, cHash, transactionHash];
    },

    async verifyHash(mc, root, oHash, cHash, transactionHash, w1) {
        const BSPRoot = mc.getBSPRoot(root, oHash, cHash);
        if (BSPRoot != null) {
            [result, owner] = await ethConnector.verifyHash(transactionHash, BSPRoot, w1);
            return [result, owner]
        }
        return [false, BSPRoot];
    },

    async validateProof(mc, leafHash, openProofTree, closedProofTree, transactionHash, w1) {
        const checkOpen = checkProof(leafHash, openProofTree);
        const checkClosed = checkProof(leafHash, closedProofTree);
        if (checkOpen || checkClosed) {
            const BSPRoot = mc.calculateHash([openProofTree.BSPRoot, closedProofTree.BSPRoot]);
            if (BSPRoot != null) {
                [result, owner] = await ethConnector.verifyHash(transactionHash, BSPRoot, w1);
                return [result, owner]
            }
            return [false, BSPRoot];
        }
        return [false, ""];
    }

}