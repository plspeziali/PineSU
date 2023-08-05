//const inquirer = require('./inquirer');
const mck = require('merkletreejs');
const crypto = require('crypto');
const fs = require('fs');
const { performance } = require('perf_hooks');
function sha256(data) {
    // returns Buffer
    return crypto.createHash('sha256').update(data).digest()
}

let tree;

module.exports = {

    // Data una lista di file, ne crea un albero
    createTree(list) {
        const result = {};
        list.forEach(p => p.split('/').reduce((o, k) => o[k] = o[k] || {}, result));
        return result;
    },

    createHashTree(list) {
        // Creo una lista notHashedList in cui sono presenti, per ora, tutte le directory
        const [dirList, filesList] = module.exports.createDirectoryList(list);
        const hashedFiles = module.exports.createHashedList(filesList);
        const hashedDirs = module.exports.calculateDirectoryHash(dirList, hashedFiles)
        const finalList = hashedFiles.concat(hashedDirs);
        finalList.sort()
        return finalList;
    },

    calculateTree(list) {
        const bufferizedLeaves = [];
        for(const el of list){
            const buffer = mck.MerkleTree.bufferify(el);
            bufferizedLeaves.push(buffer);
        }
        tree = new mck.MerkleTree(bufferizedLeaves,sha256);
        return tree.getRoot().toString('hex')
    },

    calculateUnhashedTree(list){
        list = list.filter(item => item);
        const hashedList = list.map(function(el){
            return crypto.createHash('sha256').update(el.toString()).digest('hex');
        })
        return module.exports.calculateTree(hashedList);
    },

    calculateTreeString(list, path) {
        if(list.length !== 0){
            const root = module.exports.calculateTree(list);
            return crypto.createHash('sha256').update(path+root).digest('hex');
        } else {
            return crypto.createHash('sha256').update(path).digest('hex');
        }
    },

    sameRoot(root) {
        let treeRoot = tree.getRoot().toString('hex')
        if (treeRoot) {
            return false;
        }
        return root === treeRoot;
    },

    createDirectoryList(list) {
        return module.exports.getDirectories(list);
    },

    getDirectories(list) {
        let dirList = [];
        let filesList = [];
        for(let el of list){
            if(fs.lstatSync(el).isDirectory()){
                dirList.push(el);
            } else {
                filesList.push(el);
            }
        }
        return [dirList, filesList];
    },

    // Data una lista di file, calcolo il loro hash
    createHashedList(list) {
        let result = [];
        for(let el of list){
            result.push(el+":"+module.exports.fileHashSync(el));
        }
        return result;
    },

    // Uso la tecnica del merkle tree per generare gli hash delle directory
    calculateDirectoryHash(dirList, hashedFiles) {
        let hashMapDirs = new Map();
        for(let el of hashedFiles){
            let dirSplit = el.split("/");
            let dirPath = dirSplit.slice(0, dirSplit.length - 2).join("/");
            if(dirSplit.length > 1 && hashMapDirs.has(dirPath)){
                let oldArray = hashMapDirs.get(dirPath);
                oldArray.push(el);
            } else {
                hashMapDirs.set(dirPath,new Array(el));
            }
        }
        dirList.sort();
        let hashedDirs = [];
        for(let el of dirList){
            let root = "";
            let fileList = [];
            if(hashMapDirs.has(el)) {
                let contentArray = hashMapDirs.get(el);
                //console.log(contentArray);
                for(let file of contentArray){
                    fileList.push(file.split(":")[1]);
                }
            }
            hashedDirs.push(el+":"+module.exports.calculateTreeString(fileList, el));
        }
        return hashedDirs;
    },

    fileHashSync(filePath) {

        let fileData;
        try {
            fileData = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            if (err.code === 'ENOENT') return console.error('File ' + filePath + ' does not exist. Error: ', err);

            return console.error('Error: ', err);
        }

        return '' + crypto.createHash('sha256').update(fileData, 'utf8').digest('hex');
    },

    validateProof(hash, data){

        const sgList = [];
        var flag = false;
        var otherroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            otherroot = data.witness.closedroot;
            for(let el of data.openstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        } else {
            otherroot = data.witness.openroot;
            for(let el of data.closedstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        }
        //if (flag === false) return false;
        let date = new Date(data.mkcaltimestamp);
        const sgHash = module.exports.calculateTree(sgList);
        const sgHashC = crypto.createHash('sha256').update(date.getTime().toString() + sgHash + "").digest('hex')
        if([...data.witness.syncpoints].pop() !== sgHashC){
            //return [false,"1: " + [...data.witness.syncpoints].pop() + " , " +sgHashC];
        }
        const syncpointsHashes = module.exports.calculateTree(data.witness.syncpoints);
        if([...data.witness.months].pop() !== syncpointsHashes){
            //return [false,"2: " + [...data.witness.months].pop() + " , " +syncpointsHashes];
        }
        const monthsHash = module.exports.calculateTree(data.witness.months);
        if([...data.witness.years].pop() !== monthsHash){
            //return [false,"3: " + [...data.witness.years].pop() + " , " +monthsHash];
        }
        const yearsHash = module.exports.calculateTree(data.witness.years);
        let finalroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            finalroot = crypto.createHash('sha256').update(yearsHash + otherroot +"").digest('hex')
        } else {
            finalroot = crypto.createHash('sha256').update(otherroot + yearsHash + "").digest('hex')
        }

        return [(finalroot == data.mkcalroot), {
            'sgHash':           sgHash,
            'syncpointsHashes': syncpointsHashes,
            'monthsHash':       monthsHash,
            'yearsHash':        yearsHash,
            'finalroot':        finalroot
        }];

    },

    validateProofPaper(hash, data){

        const sgList = [];
        var flag = false;
        var otherroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            otherroot = data.witness.closedroot;
            for(let el of data.openstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        } else {
            otherroot = data.witness.openroot;
            for(let el of data.closedstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        }
        //if (flag === false) return false;
        let date = new Date(data.mkcaltimestamp);
        sgList.pop();
        sgList.push(hash);
        const sgHash = module.exports.calculateTree(sgList);
        const sgHashC = crypto.createHash('sha256').update(date.getTime().toString() + sgHash + "").digest('hex')
        if([...data.witness.syncpoints].pop() !== sgHashC){
            //return [false,"1: " + [...data.witness.syncpoints].pop() + " , " +sgHashC];
        }
        data.witness.syncpoints.pop();
        data.witness.syncpoints.push(sgHashC);
        const syncpointsHashes = module.exports.calculateTree(data.witness.syncpoints);
        if([...data.witness.months].pop() !== syncpointsHashes){
            //return [false,"2: " + [...data.witness.months].pop() + " , " +syncpointsHashes];
        }
        data.witness.months.pop();
        data.witness.months.push(syncpointsHashes);
        const monthsHash = module.exports.calculateTree(data.witness.months);
        if([...data.witness.years].pop() !== monthsHash){
            //return [false,"3: " + [...data.witness.years].pop() + " , " +monthsHash];
        }
        data.witness.years.pop();
        data.witness.years.push(monthsHash);
        const yearsHash = module.exports.calculateTree(data.witness.years);
        let finalroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            finalroot = crypto.createHash('sha256').update(yearsHash + otherroot +"").digest('hex')
        } else {
            finalroot = crypto.createHash('sha256').update(otherroot + yearsHash + "").digest('hex')
        }

        return [(finalroot == data.mkcalroot), {
            'sgHash':           sgHash,
            'syncpointsHashes': syncpointsHashes,
            'monthsHash':       monthsHash,
            'yearsHash':        yearsHash,
            'finalroot':        finalroot
        }];

    },

    validateProofShow(hash, data){

        const sgList = [];
        var flag = false;
        var otherroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            otherroot = data.witness.closedroot;
            for(let el of data.openstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        } else {
            otherroot = data.witness.openroot;
            for(let el of data.closedstoragegroup){
                sgList.push(el.hash);
                if(el.hash == hash){
                    flag = true;
                }
            }
        }
        if (flag === false) return false;
        const sgHash = module.exports.calculateTree(sgList);
        /*if([...data.witness.syncpoints].pop() !== sgHash){
            return false;
        }*/
        const syncpointsHashes = module.exports.calculateTree(data.witness.syncpoints);
        /*if([...data.witness.months].pop() !== syncpointsHashes){
            return false;
        }*/
        const monthsHash = module.exports.calculateTree(data.witness.months);
        /*if([...data.witness.years].pop() !== monthsHash){
            return false;
        }*/
        const yearsHash = module.exports.calculateTree(data.witness.years);
        let finalroot;
        if(Object.hasOwn(data.witness, 'closedroot')){
            finalroot = crypto.createHash('sha256').update(yearsHash + otherroot +"").digest('hex')
        } else {
            finalroot = crypto.createHash('sha256').update(otherroot + yearsHash + "").digest('hex')
        }

        return {
            'sgHash':           sgHash,
            'syncpointsHashes': syncpointsHashes,
            'monthsHash':       monthsHash,
            'yearsHash':        yearsHash,
            'finalroot':        finalroot
        };

    }

    
}