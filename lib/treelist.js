//const inquirer = require('./inquirer');
const merkleTools = new require('merkle-tools')({hashType: 'sha1'});
const crypto = require('crypto');
const fs = require('fs');
const files = require('files');

class TreeList {
    // Data una lista di file, ne crea un albero
    createTree(list) {
        const result = {};
        list.forEach(p => p.split('/').reduce((o, k) => o[k] = o[k] || {}, result));
        return result;
    }

    createHashTree(list) {
        // Creo una lista notHashedList in cui sono presenti, per ora, tutte le directory
        const [dirList, filesList] = this.createDirectoryList(list);
        const hashedList = this.createHashedList(filesList);
        // vado a calcolare l'hash delle directory tramite il metodo introdotto dai Merkle Trees e le rimuovo gradualmente
        // da notHashedList per metterle in hashedList
        let i = 0;
        while (typeof notHashedList !== 'undefined' && notHashedList.length > 0) {
            // Se una directory è presente solo una volta in notHashedList significa che il suo contenuto è composto solo da file
            // o da directory con hash già calcolato, vado quindi a calcolare il suo hash e rimuoverla dalla lista
            if (this.createSubArray(notHashedList[i], notHashedList).length == 1) {
                const hashedValue = this.calculateDirectoryHash(notHashedList[i], this.createSubArray(notHashedList[i], hashedList));
                //console.log(hashedList);
                //hashedList = this.replaceSubstring(notHashedList[i], hashedValue, hashedList);
                hashedList.push(hashedValue);
                notHashedList.splice(i, 1);
            }
            i = (i + 1) % notHashedList.length;
        }

        return hashedList;
    }

    calculateTree(list) {
        merkleTools.resetTree();
        merkleTools.addLeaves(list);
        merkleTools.makeTree()
        const root = merkleTools.getMerkleRoot().toString('hex');
        return root;
    }

    calculateTreeString(list, path) {
        if(list.length !== 0){
            const root = calculateTree(list);
            return crypto.createHash('sha256').update(path+root).digest('hex');
        } else {
            return crypto.createHash('sha256').update(path).digest('hex');
        }
    }

    combineHash(year, month, day, hour, minute, second, hash) {
        return '' + crypto
            .createHash("sha256")
            .update(year.toString() + month.toString() + day.toString() + hour.toString() + minute.toString() + second.toString() + hash.toString())
            .digest("hex");
    }

    sameRoot(root) {
        if (!merkleTools.getMerkleRoot()) {
            return false;
        }
        return root === merkleTools.getMerkleRoot().toString('hex');
    }

    getProof(leaf) {
        let i = 0;
        for (i = 0; i < merkleTools.getLeafCount(); i++) {
            if (merkleTools.getLeaf(i).toString('hex') == leaf) {
                return merkleTools.getProof(i);
            }
        }
        return null;
    }

    validateProof(proof, hash, root) {
        return merkleTools.validateProof(proof, hash, root);
    }

    createDirectoryList(list) {
        return files.getDirectories(list);
    }

    // Data una lista di file, calcolo il loro hash
    createHashedList(list) {
        let result = Array();
        list = list.filter(function (e) {
            return e
        });
        for (let path of list) {
            const pathsplit = path.split('/');
            if (pathsplit[pathsplit.length - 1].split(":").length == 1) {
                result.push(path + ":" + this.fileHashSync(path));
            } else {
                result.push(path);
            }
        }
        result = result.filter(function (e) {
            return e
        });
        return result;
    }


    // Data una substring, estraggo un sottoarray in cui quella substring è presente in ogni elemento
    createSubArray(substring, array) {
        const result = Array();
        for (let el of array) {
            if (typeof el !== "undefined" && el.includes(substring)) {
                result.push(el);
            }
        }
        return result;
    }

    // Uso la tecnica del merkle tree per generare gli hash delle directory
    calculateDirectoryHash(dirpath, contentslist) {
        const lowerLevel = Array();
        for (let content of contentslist) {
            lowerLevel.push(content.split(":")[1]);
        }
        let root;
        if(lowerLevel.length === 0){
            root = this.calculateTreeString([], dirpath);
        } else {
            root = this.calculateTreeString(lowerLevel, dirpath);
        }

        return dirpath + ":" + root;
    }

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

module.exports = TreeList;