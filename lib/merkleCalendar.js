const InternalCalendar = require('../lib/internalCalendar');
const treelist = require('../lib/treelist');
const LeafCalendar = require('../lib/leafCalendar');
const {validateProof} = require("../logic/ethLogic");

class MerkleCalendar {

    #closed;
    #open;

    constructor() {
        this.#closed = new InternalCalendar("Closed", 0, null);
        this.#open = new InternalCalendar("Open", 0, null);
    }

    addRegistration(name, hash, year, month, day, hour, minute, second, closed) {
        let tree = this.#open;
        if (closed) {
            tree = this.#closed;
        }
        let monthNode = null;
        let yearNode = tree.getChildByName(year);
        if (yearNode != null) {
            monthNode = yearNode.getChildByName(month);
        }
        if (yearNode == null) {
            yearNode = new InternalCalendar(year, 1, tree);
            tree.addChild(yearNode);
        }
        if (monthNode == null) {
            monthNode = new InternalCalendar(month, 2, yearNode);
            yearNode.addChild(monthNode);
        }
        let leaf = this.createLeaf(name, year, month, day, hour, minute, second, hash, monthNode);
        monthNode.addChild(leaf);
        monthNode.calculateHash();
        yearNode.calculateHash();
        tree.calculateHash();
        return leaf;
    }

    addRegistrationD(name, hash, date, closed) {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        return this.addRegistration(name, hash, year, month, day, hour, minute, second, closed);
    }

    addRegistrationNC(name, hash, year, month, day, hour, minute, second, closed, mHash, yHash) {
        let tree = this.#open;
        if (closed) {
            tree = this.#closed;
        }
        let monthNode = null;
        let yearNode = tree.getChildByName(year);
        if (yearNode != null) {
            monthNode = yearNode.getChildByName(month);
        }
        if (yearNode == null) {
            yearNode = new InternalCalendar(year, 1, tree);
            tree.addChild(yearNode);
        }
        if (monthNode == null) {
            monthNode = new InternalCalendar(month, 2, yearNode);
            yearNode.addChild(monthNode);
        }
        let leaf = this.createLeaf(name, year, month, day, hour, minute, second, hash, monthNode);
        monthNode.addChild(leaf);
        monthNode.setHash(mHash);
        yearNode.setHash(yHash);
        return leaf;
    }

    getBSPRoot(hash, oHash, cHash) {
        let findC = this.#closed.findNode(hash);
        let findO = this.#open.findNode(hash);
        let closed = false;
        let node = null;
        if (findC != null) {
            console.log(findC.getParent().get)
            node = findC;
            closed = true;
        } else if (findO != null) {
            node = findO;
        }
        if (node == null) {
            return null;
        }
        let monthNode = node.getParent();
        let yearNode = node.getParent().getParent();
        let leafIndex = monthNode.indexOf(node);
        let leavesHash = [];
        for (let i = 0; i <= leafIndex; i++) {
            leavesHash.push(monthNode.getChildByNum(i).getHash());
        }
        let newMonth = this.calculateHash(leavesHash);
        let monthIndex = yearNode.indexOf(monthNode);
        let monthsHash = [];
        for (let i = 0; i < monthIndex; i++) {
            monthsHash.push(yearNode.getChildByNum(i).getHash());
        }
        monthsHash.push(newMonth);
        let newYear = this.calculateHash(monthsHash);
        let yearIndex = yearNode.indexOf(yearNode);
        let yearsHash = [];
        for (let i = 0; i < yearIndex; i++) {
            yearsHash.push(yearNode.getChildByNum(i).getHash());
        }
        yearsHash.push(newYear);
        let newRoot = this.calculateHash(yearsHash);
        if (closed) {
            if (oHash != null) {
                return this.calculateHash([oHash, newRoot]);
            } else {
                return newRoot;
            }
        } else {
            if (cHash != null) {
                return this.calculateHash([newRoot, cHash]);
            } else {
                return newRoot;
            }
        }
    }

    calculateHash(list) {
        console.log(list)
        return treelist.calculateTree(list);
    }

    calculateProof(leaf) {
        console.log(leaf)
        return treelist.getProof(leaf);
    }

    combineHash(year, month, day, hour, minute, second, hash) {
        return treelist.combineHash(year, month, day, hour, minute, second, hash);
    }

    createLeaf(name, year, month, day, hour, minute, second, hash, monthNode) {
        let newHash = this.combineHash(year, month, day, hour, minute, second, hash);
        return new LeafCalendar(name, day, hour, minute, second, newHash, monthNode);
    }

    loadTree(open, closed) {
        this.#open = open;
        this.#closed = closed;
    }

    getTree() {
        return [this.#open, this.#closed];
    }

    getLeaves() {
        let date;
        let leaf;
        let month;
        let year;
        const openA = new Array();
        const closedA = new Array();
        for (year of this.#open.getChildren()) {
            for (month of year.getChildren()) {
                for (leaf of month.getChildren()) {
                    date = new Date();
                    date.setFullYear(leaf.getParent().getParent().getName());
                    date.setMonth(leaf.getParent().getName());
                    date.setDate(leaf.getDay());
                    date.setHours(leaf.getHour(), leaf.getMinute());
                    openA.push({
                        name: leaf.getName(),
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: leaf.getDay(),
                        hour: leaf.getHour(),
                        minute: leaf.getMinute(),
                        second: leaf.getSecond(),
                        hash: leaf.getHash()
                    });
                }
            }
        }
        for (year of this.#closed.getChildren()) {
            for (month of year.getChildren()) {
                for (leaf of month.getChildren()) {
                    date = new Date();
                    date.setFullYear(leaf.getParent().getParent().getName());
                    date.setMonth(leaf.getParent().getName());
                    date.setDate(leaf.getDay());
                    date.setHours(leaf.getHour(), leaf.getMinute());
                    closedA.push({
                        name: leaf.getName(),
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: leaf.getDay(),
                        hour: leaf.getHour(),
                        minute: leaf.getMinute(),
                        second: leaf.getSecond(),
                        hash: leaf.getHash()
                    });
                }
            }
        }
        return [openA, closedA]
    }

    getTrees() {
        let date;
        let leaf;
        let month;
        let year;
        let openT, closedT, openM, closedM, openA, closedA;
        openT = [];
        for (year of this.#open.getChildren()) {
            openM = [];
            for (month of year.getChildren()) {
                openA = [];
                for (leaf of month.getChildren()) {
                    date = new Date();
                    date.setFullYear(leaf.getParent().getParent().getName());
                    date.setMonth(leaf.getParent().getName());
                    date.setDate(leaf.getDay());
                    date.setHours(leaf.getHour(), leaf.getMinute());
                    openA.push({
                        name: leaf.getName(),
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: leaf.getDay(),
                        hour: leaf.getHour(),
                        minute: leaf.getMinute(),
                        second: leaf.getSecond(),
                        hash: leaf.getHash()
                    });
                }
                openM.push({
                    name: month.getName(),
                    hash: month.getHash(),
                    children: openA
                });
            }
            openT.push({
                name: year.getName(),
                hash: year.getHash(),
                children: openM
            });
        }
        closedT = [];
        for (year of this.#closed.getChildren()) {
            closedM = [];
            for (month of year.getChildren()) {
                closedA = [];
                for (leaf of month.getChildren()) {
                    date = new Date();
                    date.setFullYear(leaf.getParent().getParent().getName());
                    date.setMonth(leaf.getParent().getName());
                    date.setDate(leaf.getDay());
                    date.setHours(leaf.getHour(), leaf.getMinute());
                    closedA.push({
                        name: leaf.getName(),
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: leaf.getDay(),
                        hour: leaf.getHour(),
                        minute: leaf.getMinute(),
                        second: leaf.getSecond(),
                        hash: leaf.getHash()
                    });
                }
                closedM.push({
                    name: month.getName(),
                    hash: month.getHash(),
                    children: closedA
                });
            }
            closedT.push({
                name: year.getName(),
                hash: year.getHash(),
                children: closedM
            });
        }
        return [openT, closedT]
    }

    getMCRoot() {
        const cHash = this.#closed.getHash();
        const oHash = this.#open.getHash();
        if (cHash == null) {
            if (oHash == null) {
                return [null, null];
            }
            return [oHash, null];
        }
        if (oHash == null) {
            return [null, cHash];
        }
        return [oHash, cHash];
    }

    getProof(leaf, root) {
        const proofTree = {};
        let proof = this.generateProof(leaf);
        const monthNode = leaf.getParent();
        Object.assign(proofTree, {monthProof: proof});
        Object.assign(proofTree, {monthHash: monthNode.getHash()});

        proof = this.generateProof(monthNode);
        const yearNode = monthNode.getParent();
        Object.assign(proofTree, {yearProof: proof});
        Object.assign(proofTree, {yearHash: yearNode.getHash()});

        proof = this.generateProof(yearNode);
        const rootNode = monthNode.getParent();
        Object.assign(proofTree, {rootProof: proof});
        Object.assign(proofTree, {rootHash: rootNode.getHash()});
        Object.assign(proofTree, {BSPRoot: root});
        return proofTree;
    }

    generateProof(node) {
        const parent = node.getParent();
        const hashes = parent.getChildrenHashes();
        this.calculateHash(hashes);
        return this.calculateProof(leaf.getHash());
    }

    checkProof(node, proofTree) {
        let result = validateProof(proofTree.monthProof, node.getHash(), proofTree.monthHash);
        node = node.getParent();
        result = result && validateProof(proofTree.yearProof, node.getHash(), proofTree.yearHash);
        node = node.getParent();
        result = result && validateProof(proofTree.rootProof, node.getHash(), proofTree.rootHash);
        return result;
    }

}

module.exports = MerkleCalendar;