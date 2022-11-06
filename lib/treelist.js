//const inquirer = require('./inquirer');
const merkleTools = new require('merkle-tools')({hashType: 'sha256'});
const crypto = require('crypto');
const fs = require('fs');
const HashMap = require('hashmap');

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
        merkleTools.resetTree();
        merkleTools.addLeaves(list);
        merkleTools.makeTree()
        return merkleTools.getMerkleRoot().toString('hex');
    },

    calculateUnhashedTree(list){
        merkleTools.resetTree();
        list = list.filter(item => item);
        const hashedList = list.map(function(el){
            return crypto.createHash('sha256').update(el.toString()).digest('hex');
        })
        console.log(hashedList)
        merkleTools.addLeaves(hashedList);
        merkleTools.makeTree();
        return merkleTools.getMerkleRoot().toString('hex');
    },

    calculateTreeString(list, path) {
        if(list.length !== 0){
            const root = module.exports.calculateTree(list);
            return crypto.createHash('sha256').update(path+root).digest('hex');
        } else {
            return crypto.createHash('sha256').update(path).digest('hex');
        }
    },

    combineHash(year, month, day, hour, minute, second, hash) {
        return `${crypto
            .createHash("sha256")
            .update(year.toString() + month.toString() + day.toString() + hour.toString() +
                +minute.toString() + second.toString() + hash.toString())
            .digest("hex")}`;
    },

    sameRoot(root) {
        if (!merkleTools.getMerkleRoot()) {
            return false;
        }
        return root === merkleTools.getMerkleRoot().toString('hex');
    },

    getProof(leaf) {
        let i = 0;
        for (i = 0; i < merkleTools.getLeafCount(); i++) {
            if (merkleTools.getLeaf(i).toString('hex') === leaf) {
                return merkleTools.getProof(i);
            }
        }
        return null;
    },

    validateProof(proof, hash, root) {
        return merkleTools.validateProof(proof, hash, root);
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
                console.log(contentArray);
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
    }
}