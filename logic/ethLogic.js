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
        const mapR = [];
        for (let su in storageGroup){
            map.push(new mkc.StorageUnit(su.hash,su.uuid));
            mapR.push({
                'hash': su.hash,
                'uuid': su.uuid
            })
        }
        const sg = new mkc.StorageGroup(hash, map);
        const leaf = mc.addRegistration(uuid, hash, date, closed, sg, null, null);
        const month = leaf.parent;
        const year = month.parent;
        let witness;
        if (!closed){
            witness = {
                closedroot: mc.closed.hash,
                years: mc.open.getChildrenHashes(),
                months: year.getChildrenHashes(),
                syncpoints: month.getChildrenHashes()
            }
        } else {
            witness = {
                openroot: mc.open.hash,
                years: mc.closed.getChildrenHashes(),
                months: year.getChildrenHashes(),
                syncpoints: month.getChildrenHashes()
            }
        }
        return [witness, mapR];
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
        let mkcHash = mc.getMCRoot();
        const receipt = await ethConnector.deploy(mkcHash);
        const block = await ethConnector.getBlock(receipt.blockNumber);
        return [mkcHash, receipt, block.timestamp];
    },

    async verifyHash(transactionHash, block, root, w1) {
        return await ethConnector.verifyHash(transactionHash, block, root, w1);
    },

    async validateProof(mc, leafHash, openProofTree, closedProofTree, transactionHash, w1) {
        const checkOpen = mc.checkProof(leafHash, openProofTree);
        const checkClosed = mc.checkProof(leafHash, closedProofTree);
        if (checkOpen || checkClosed) {
            const BSPRoot = mc.calculateHash([openProofTree.BSPRoot, closedProofTree.BSPRoot]);
            if (BSPRoot != null) {
                [res, owner] = await ethConnector.verifyHash(transactionHash, BSPRoot, w1);
                return [res, owner]
            }
            return [false, BSPRoot];
        }
        return [false, ""];
    }

}