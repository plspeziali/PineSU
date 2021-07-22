var merkleTools = new require('merkle-tools')({hashType: 'sha1'});
var LeafCalendar = require('../lib/leafCalendar');

class InternalCalendar{

    #name;
    #category;    //0: Open or Closed Subtree root, 1: year, 2: month
    #parent;
    #children;
    #hash;
    
    constructor(name, category, parent){
        this.#name = name;
        this.#category = category;
        this.#parent = parent;
        this.#children = new Array();
    }

    addChild(node){
        this.#children.push(node);
        if(this.#category == 2){
            this.#children.sort(function (a, b) {   
                return a.getDay() - b.getDay() || a.getHour() - b.getHour() || a.getMinute() - b.getMinute();
            });
        } else {
            this.#children.sort(function (a, b) {   
                return a.getName() - b.getName();
            });
        }
    }

    calculateHash(){
        merkleTools.resetTree();
        let list = new Array();
        for(var el of this.#children){
            list.push(el.getHash);
        }
        merkleTools.addLeaves(list);
        merkleTools.makeTree()
        this.#hash = merkleTools.getMerkleRoot().toString('hex');
    }

    getName(){
        return this.#name;
    }

    getCategory(){
        return this.#category;
    }

    getParent(){
        return this.#parent;
    }

    getHash(){
        return this.#hash;
    }

    getChildByNum(num){
        return this.#children[num];
    }

    getChildByName(name){
        for(var el of this.#children){
            if(el.getName() == name){
                return el;
            }
        }
        return null;
    }

    indexOf(name){
        return this.#children.indexOf(name);
    }

    findNode(hash){
        for(var el of this.#children){
            if(el.getHash() == hash){
                return el;
            }
            let ret = null;
            if(this.#category != 2){
                ret = el.findNode(hash);
            }
            if(ret != null){
                return ret;
            }
        }
        return null;
    }

}

module.exports = InternalCalendar;