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

        return filesList;
    },

    calculateTree(list) {
        merkleTools.resetTree();
        merkleTools.addLeaves(list);
        merkleTools.makeTree()
        const root = merkleTools.getMerkleRoot().toString('hex');
        return root;
    },

    calculateTreeString(list, path) {
        if(list.length !== 0){
            const root = calculateTree(list);
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
            if (merkleTools.getLeaf(i).toString('hex') == leaf) {
                return merkleTools.getProof(i);
            }
        }
        return null;
    },

    validateProof(proof, hash, root) {
        return merkleTools.validateProof(proof, hash, root);
    },

    createDirectoryList(list) {
        module.exports.getDirectories(list);
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
        let hashDirs = new HashMap();
        for(let el of hashedFiles){
            let dirSplit = el.split("/");
            let dirPath = dirSplit.slice(0, dirSplit.length - 2).join("/") + "/";
            if(hashDirs.has(dirPath)){
                let oldArray = hashDirs.get(dirPath);
                oldArray.push(el);
            } else {
                hashDirs.set(dirPath,[el]);
            }
        }
        dirList.sort();
        for(let el of hashedFiles){

        }
        return hashDirs;
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