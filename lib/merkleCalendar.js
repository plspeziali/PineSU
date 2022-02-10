var InternalCalendar = require('../lib/internalCalendar');
var TreeListC = require('../lib/treelist');
var treelist = new TreeListC();
var LeafCalendar = require('../lib/leafCalendar');

class MerkleCalendar{

    #closed;
    #open;
    
    constructor(){
        this.#closed = new InternalCalendar("Closed",0,null);
        this.#open = new InternalCalendar("Open",0,null);
    }

    addRegistration(name, hash, year, month, day, hour, minute, second, closed){
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
        let leaf = this.createLeaf(name, year, month, day, hour, minute, second, hash, monthNode);
        monthNode.addChild(leaf);
        monthNode.calculateHash();
        yearNode.calculateHash();
        tree.calculateHash();
    }

    addRegistrationD(name, hash, date, closed){
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        this.addRegistration(name, hash, year, month, day, hour, minute, second, closed);
    }

    addRegistrationNC(name, hash, year, month, day, hour, minute, second, closed, mHash, yHash){
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
        let leaf = this.createLeaf(name, year, month, day, hour, minute, second, hash, monthNode);
        monthNode.addChild(leaf);
        monthNode.setHash(mHash);
        yearNode.setHash(yHash);
    }

    getBSPRoot(hash, oHash, cHash){
        let findC = this.#closed.findNode(hash);
        let findO = this.#open.findNode(hash);
        let closed = false;
        let node = null;
        if(findC != null){
            console.log(findC.getParent().get)
            node = findC;
            closed = true;
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
        for(let i = 0; i <= leafIndex; i++){
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
        if(closed){
            if(oHash != null){
                return this.calculateHash([oHash, newRoot]);
            } else {
                return newRoot;
            }
        }else{
            if(cHash != null){
                return this.calculateHash([newRoot, cHash]);
            } else {
                return newRoot;
            }
        }
    }

    calculateHash(list){
        console.log(list)
        return treelist.calculateTree(list);
    }

    combineHash(year, month,day, hour, minute, second, hash){
        return treelist.combineHash( year, month, day, hour, minute, second, hash);
    }

    createLeaf(name, year, month, day, hour, minute, second, hash, monthNode){
        let newHash = this.combineHash( year, month,day, hour, minute, second, hash);
        return new LeafCalendar(name, day, hour, minute, second, newHash, monthNode);
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
                    var date = new Date();
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
        for(var year of this.#closed.getChildren()){
            for(var month of year.getChildren()){
                for(var leaf of month.getChildren()){
                    var date = new Date();
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
        return [openA,closedA]
    }

    getTrees(){
        var openT, closedT, openM, closedM, openA,closedA;
        openT = new Array();
        for(var year of this.#open.getChildren()){
            openM = new Array();
            for(var month of year.getChildren()){
                openA = new Array();
                for(var leaf of month.getChildren()){
                    var date = new Date();
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
        closedT = new Array();
        for(var year of this.#closed.getChildren()){
            closedM = new Array();
            for(var month of year.getChildren()){
                closedA = new Array();
                for(var leaf of month.getChildren()){
                    var date = new Date();
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
        return [openT,closedT]
    }

    getMCRoot(){
        var cHash = this.#closed.getHash();
        var oHash = this.#open.getHash();
        if(cHash == null){
            if(oHash == null){
                return [null, null];
            }
            return [oHash, null];
        }
        if(oHash == null){
            return [null, cHash];
        }
        return [oHash, cHash];
    }

    generateProof(leaf){
        var proofTree = {};
        // TODO
        return proofTree
    }

    validateProof(leafRoot, mcRoot, proofTree){
        // TODO
    }

}

module.exports = MerkleCalendar;