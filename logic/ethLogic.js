const EthConnector = require('../connectors/ethConnector');
const {v4: uuidv4} = require("uuid");
const mkc = require('merkle-calendar');

let ethConnector;

module.exports = {

    connect(w1, w2, k, h) {
        ethConnector = new EthConnector(h, w1, w2, k);
    },

    addToTreeND(hash, mc, closed, storageGroup) {
        const date = new Date();
        return module.exports.addToTree(hash, mc, closed, date, storageGroup);
    },

    addToTree(hash, mc, closed, date, storageGroup) {
        const uuid = uuidv4();
        const map = [];
        for (let su in storageGroup){
            map.push({
                hash: su.hash,
                uuid: su.uuid
            })
        }
        const sg = new mkc.StorageGroup(hash, map);
        const leaf = mc.addRegistration(uuid, hash, date, closed, sg, null, null);
        return mc.generateProof(leaf);
    },

    deserializeMC(mcFile) {
        const mc = new mkc.MerkleCalendar();
        mc.deserializeMC(mcFile);
        return mc;
    },

    returnEmptyMC(){
        return new mkc.MerkleCalendar();
    },

    serializeMC(mc) {
        return mc.serializeMC();
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