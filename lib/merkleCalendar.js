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

    addRegistration(name, hash, date, closed){
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
        let leaf = new LeafCalendar(name, day, hour, minute, hash, monthNode);
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
        return merkleTools.getMerkleRoot().toString('hex');
    }

    loadTree(open, closed){
        this.#open = open;
        this.#closed = closed;
    }

    getTree(){
        return [this.#open, this.#closed];
    }

    getLeaves(){
        var openA = new Array();
        var closedA = new Array();
        for(var year of this.#open.getChildren()){
            for(var month of year.getChildren()){
                for(var leaf of month.getChildren()){
                    let newLeaf = Object.assign({}, leaf);
                    var date = new Date();
                    date.setFullYear(newLeaf.getParent().getParent().getName());
                    date.setMonth(newLeaf.getParent().getName());
                    date.setDay(newLeaf.getDay());
                    date.setHours(newLeaf.getHour(), newLeaf.getMinute())
                    delete newLeaf.parent;
                    openA.push(newLeaf);
                }
            }
        }
        for(var year of this.#closed.getChildren()){
            for(var month of year.getChildren()){
                for(var leaf of month.getChildren()){
                    let newLeaf = Object.assign({}, leaf);
                    var date = new Date();
                    date.setFullYear(newLeaf.getParent().getParent().getName());
                    date.setMonth(newLeaf.getParent().getName());
                    date.setDay(newLeaf.getDay());
                    date.setHours(newLeaf.getHour(), newLeaf.getMinute())
                    delete newLeaf.parent;
                    closedA.push(newLeaf);
                }
            }
        }
        return [openA,closedA]
    }

    getMCRoot(){
        return this.calculateHash(this.#closed.getHash(), this.#open.getHash());
    }

}

module.exports = MerkleCalendar;