const merkleTools = new require('merkle-tools')({hashType: 'sha256'});
const LeafCalendar = require('../lib/leafCalendar');

class InternalCalendar {

    #name;
    #category;    //0: Open or Closed Subtree root, 1: year, 2: month
    #parent;
    #children;
    #hash;

    constructor(name, category, parent) {
        this.#name = name;
        this.#category = category;
        this.#parent = parent;
        this.#children = [];
        this.#hash = null;
    }

    addChild(node) {
        this.#children.push(node);
        if (this.#category == 2) {
            this.#children.sort(function (a, b) {
                return a.getDay() - b.getDay() || a.getHour() - b.getHour() || a.getMinute() - b.getMinute() || a.getSecond() - b.getSecond();
            });
        } else {
            this.#children.sort(function (a, b) {
                return a.getName() - b.getName();
            });
        }
    }

    calculateHash() {
        merkleTools.resetTree();
        let list = [];
        for (let el of this.#children) {
            if (el.getHash() != null) {
                list.push(el.getHash());
            }
        }
        if (list.length != 0) {
            merkleTools.addLeaves(list);
            merkleTools.makeTree()
            this.#hash = merkleTools.getMerkleRoot().toString('hex');
        }
    }

    getName() {
        return this.#name;
    }

    getCategory() {
        return this.#category;
    }

    getParent() {
        return this.#parent;
    }

    getHash() {
        return this.#hash;
    }

    setHash(hash) {
        this.#hash = hash;
    }

    getChildren() {
        return this.#children;
    }

    getChildrenHashes() {
        let children = this.getChildren();
        const hashes = [];
        for (let c of children) {
            hashes.push(c.getHash());
        }
        return hashes;
    }

    getChildByNum(num) {
        return this.#children[num];
    }

    getChildByName(name) {
        for (let el of this.#children) {
            if (el.getName() == name) {
                return el;
            }
        }
        return null;
    }

    indexOf(name) {
        return this.#children.indexOf(name);
    }

    findNode(hash) {
        for (let el of this.#children) {
            if (el.getHash() == hash && this.#category == 2) {
                return el;
            }
            let ret = null;
            if (this.#category != 2) {
                ret = el.findNode(hash);
            }
            if (ret != null) {
                return ret;
            }
        }
        return null;
    }

}

module.exports = InternalCalendar;