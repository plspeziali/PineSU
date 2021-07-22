var InternalCalendar = require('../lib/internalCalendar');
var merkleTools = new require('merkle-tools')({hashType: 'sha1'});
var LeafCalendar = require('../lib/leafCalendar');

class MerkleCalendar{

    #closed;
    #open;
    
    constructor(){
        this.#closed = new InternalCalendar("Closed",0,null);
        this.#open = new InternalCalendar("Open",0,null);
    }

    addRegistration(name, hash, date, transactionHash, closed){
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let tree = this.#open;
        if(closed){
            tree = this.#closed;
        }
        let monthNode = null;
        let yearNode = tree.getChildByName(year);
        if(yearNode != null){
            monthNode = yearNode.getChildByName(month);
        }
        if(yearNode == null){
            yearNode = new InternalCalendar(year,1,tree);
            tree.addChild(yearNode);
        }
        if(monthNode == null){
            monthNode = new InternalCalendar(month,2,yearNode);
            yearNode.addChild(monthNode);
        }
        let leaf = new LeafCalendar(name, day, hour, minute, hash, transactionHash, monthNode);
        monthNode.addChild(leaf);
        monthNode.recalculateHash();
        yearNode.recalculateHash();
        tree.recalculateHash();
    }

    getBSPRoot(hash){
        let findC = this.#closed.findNode(hash);
        let findO = this.#open.findNode(hash);
        let root = this.#open;
        let node = null;
        if(findC != null){
            node = findC;
            root = this.#closed;
        }else if(findO != null){
            node = findO;
        }
        if(node == null){
            return null;
        }
        let monthNode = node.getParent();
        let yearNode = node.getParent().getParent();
        let leafIndex = monthNode.indexOf(node);
        let leavesHash = new Array();
        for(let i = 0; i < leafIndex; i++){
            leavesHash.push(monthNode.getChildByNum(i).getHash());
        }
        let newMonth = this.calculateHash(leavesHash);
        let monthIndex = yearNode.indexOf(monthNode);
        let monthsHash = new Array();
        for(let i = 0; i < monthIndex; i++){
            monthsHash.push(yearNode.getChildByNum(i).getHash());
        }
        monthsHash.push(newMonth);
        let newYear = this.calculateHash(monthsHash);
        let yearIndex = yearNode.indexOf(yearNode);
        let yearsHash = new Array();
        for(let i = 0; i < yearIndex; i++){
            yearsHash.push(yearNode.getChildByNum(i).getHash());
        }
        yearsHash.push(newYear);
        let newRoot = this.calculateHash(yearsHash);
        return newRoot;
    }

    calculateHash(list){
        merkleTools.resetTree();
        merkleTools.addLeaves(list);
        merkleTools.makeTree()
        this.#hash = merkleTools.getMerkleRoot().toString('hex');
    }

}

module.exports = MerkleCalendar;