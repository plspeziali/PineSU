const fs = require('fs');
const path = require('path');
const touch = require('touch');
const _und = require("underscore");
const inquirer = require('./inquirer');
const treelist = require('./treelist');
const hidefile = require('hidefile');
const ethLogic = require('../logic/ethLogic')
const AdmZip = require('adm-zip');

module.exports = {
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    getCurrentDirectoryABS: () => {
        return process.cwd().replace(/\\/g, "/");
    },

    fileExists: (filePath) => {
        return fs.existsSync(filePath);
    },

    readFile(filePath, cod) {
        return fs.readFileSync(filePath, cod);
    },

    readWallet: async (choice) => {
        if (fs.existsSync(__dirname + '/../config.json') && !choice) {
            const data = fs.readFileSync(__dirname + '/../config.json');
            return JSON.parse(data.toString());
        } else {
            return module.exports.writeWallet();
        }
    },

    writeWallet: async () => {
        const answers = await inquirer.chooseAddresses();
        const o = {
            wallet1: answers.wallet1,
            wallet2: answers.wallet2,
            pkey: answers.pkey
        };
        fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(o));
        return o;
    },

    createSGTrees: (sg) => {
        let el;
        const open = [];
        const openHashes = [];
        const closed = [];
        const closedHashes = [];
        for (el of sg) {
            if (el.closed) {
                closed.push(el);
                closedHashes.push(el.hash);
            } else {
                open.push(el);
                openHashes.push(el.hash);
            }
        }
        let openRoot = null;
        if (openHashes.length !== 0) {
            openRoot = treelist.calculateTree(openHashes);
        }
        let closedRoot = null;
        if (closedHashes.length !== 0) {
            closedRoot = treelist.calculateTree(closedHashes);
        }
        return [openRoot, closedRoot, open, closed];
    },

    flushSG: () => {
        module.exports.saveSG([]);
    },

    savePineSUJSON: async (obj) => {

        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json")) {
            const content = module.exports.readPineSUFile();
            module.exports.createPineSUOld();
            const contentJSON = JSON.stringify(content);
            const contentDate = new Date(content.header.crtime);
            fs.writeFileSync(process.cwd().replace(/\\/g, "/") + "/.pinesuhistory/pinesu_" + contentDate.toISOString().replace(/\W/g, "") + "_" + content.hash + ".json", contentJSON);
        }

        const jsonContent = JSON.stringify(obj);

        fs.writeFile(process.cwd() + "/.pinesu.json", jsonContent, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
        });

    },

    getFilelist: (dir, filelist) => {
        if(dir === ""){
            dir = ".";
        }
        const forbiddenFiles = [".git", ".pinesuhistory", ".pinesu.json", ".regpinesu.json", ".gitignore", ".gitkeep"];
        fs.readdirSync(dir).forEach(file => {
            if(!forbiddenFiles.includes(file)){
                let fullPath = path.join(dir, file);
                if (fs.lstatSync(fullPath).isDirectory()) {
                    module.exports.fixDirEmpty(fullPath);
                    filelist.push(fullPath);
                    module.exports.getFilelist(fullPath, filelist);
                } else {
                    filelist.push(fullPath);
                }
            }

        });
    },

    fixDirEmpty: (dirname) => {
        if(fs.readdirSync(dirname).length === 0){
            fs.openSync(dirname+"/.gitkeep", 'w');
        }
    },

    getDirectories: (list) => {
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

    createRegistration: (el) => {
        const path = ""+el.path
        delete el.path

        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.regpinesu.json")) {
            const content = module.exports.readRegistrationFile();
            module.exports.createPineSUOld();
            const contentJSON = JSON.stringify(content);
            const contentDate = new Date(content.date);
            fs.writeFileSync(process.cwd().replace(/\\/g, "/") + "/.pinesuhistory/regpinesu" + contentDate.toISOString() + "_" + content.root + ".json", contentJSON);
        }

        try {
            fs.writeFileSync(path + "/.regpinesu.json", JSON.stringify(el));
        } catch (err) {
            console.log('There has been an error parsing your JSON.')
            console.log(err);
        }

        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json")) {
            return module.exports.readPineSUFile();
        }
    },

    createPineSUOld: () => {
        if (!fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pinesuhistory/")) {
            fs.mkdirSync(process.cwd().replace(/\\/g, "/") + "/.pinesuhistory/");
            hidefile.hideSync(process.cwd().replace(/\\/g, "/") + "/.pinesuhistory/");
        }
    },

    createGitignore: async () => {
        const treeList = _und.without(fs.readdirSync(process.cwd()), '.git', '.gitignore');

        if (treeList.length) {
            const answers = await inquirer.askIgnoreFiles(treeList);

            if (answers.ignore.length) {
                fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
            } else {
                await touch('.gitignore');
            }
        } else {
            touch('.gitignore');
        }
    },

    closePineSUFile: () => {
        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json")) {
            const data = fs.readFileSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json");
            try {
                const myObj = JSON.parse(data.toString());
                myObj.offhash.closed = true;
                fs.writeFileSync('.pinesu.json', JSON.stringify(myObj));
                return myObj;
            } catch (err) {
                console.log('There has been an error parsing your JSON.')
                console.log(err);
            }
        } else {
            return [null];
        }
    },

    readPineSUFile: () => {
        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json")) {
            const data = fs.readFileSync(process.cwd().replace(/\\/g, "/") + "/.pinesu.json");
            try {
                return JSON.parse(data.toString());
            } catch (err) {
                console.log('There has been an error parsing your JSON.')
                console.log(err);
            }
        } else {
            const pineSUFile = {};
            pineSUFile.hash = null;
            pineSUFile.header = {};

            pineSUFile.header.prevmkcalroot = null;
            pineSUFile.header.prevsuhash = null;
            pineSUFile.header.prevbcregnumber = null;
            pineSUFile.header.prevbcregtime = null;
            pineSUFile.header.prevclosed = null;
            pineSUFile.header.merkleroot = null;

            pineSUFile.filelist = null;
            pineSUFile.offhash = {};

            pineSUFile.offhash.bcregnumber = 0;
            pineSUFile.offhash.bcregtime = null;
            pineSUFile.offhash.closed = false;
            return pineSUFile;
        }
    },

    readRegistrationFile: () => {
        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.regpinesu.json")) {
            const data = fs.readFileSync(process.cwd().replace(/\\/g, "/") + "/.regpinesu.json");
            try {
                return JSON.parse(data.toString());
            } catch (err) {
                console.log('There has been an error parsing your JSON.')
                console.log(err);
            }
        } else {
            return ["null"];
        }
    },

    isClosed: () => {
        if (fs.existsSync('.pinesu.json')) {
            const myObj = module.exports.readPineSUFile();
            return myObj.closed;
        }
        return false;
    },

    readPifile: () => {
        if (fs.existsSync(process.cwd().replace(/\\/g, "/") + "/.pifiles.json")) {
            const data = fs.readFileSync(process.cwd().replace(/\\/g, "/") + "/" + "/.pifiles.json");
            try {
                return JSON.parse(data.toString());
            } catch (err) {
                console.log('There has been an error parsing your JSON.')
                console.log(err);
            }
        } else {
            return ["null"];
        }
    },

    distributeSU: async () => {
        const pinesu = module.exports.readPineSUFile();

        if (pinesu[0] === "null") {
            return ["null"];
        }

        const fileList = pinesu.filelist;
        const finalList = [];
        let el;
        for (let i = 0; i < fileList.length; i++) {
            el = fileList[i].split(":")[0];
            if (typeof (el) == "undefined" || el.includes(".pinesu.json") || el.includes(".gitignore") || fs.lstatSync(el).isDirectory()) {

            } else {
                finalList.push(fileList[i])
            }
        }

        if (finalList[0] !== "null") {
            if (finalList.length) {
                const answers = await inquirer.askSUExport(finalList);

                if (answers.export.length) {
                    return answers.export;
                }
            }
        }
        return ["null"];
    },

    checkRegistration: (hash) => {
        if (fs.existsSync(".regpinesu.json")) {
            const data = fs.readFileSync(".regpinesu.json");
            try {
                const reg = JSON.parse(data.toString());
                const proof = treelist.validateProof(hash, reg);
                //console.log(proof[1])
                if (proof[0]) {
                    return [true, reg];
                } else {
                    return [false, null];
                }
            } catch (err) {
                console.log('There has been an error parsing your JSON.')
                console.log(err);
            }
        } else {
            return [false, null];
        }
    },

    createZIP: (list, json) => {
        const zip = new AdmZip();

        // add file directly
        const content = JSON.stringify(json);
        zip.addFile(".pifiles.json", Buffer.alloc(content.length, content));
        if (fs.existsSync(".regpinesu.json")) {
            zip.addLocalFile(".regpinesu.json");
        }
        // add local file
        for (let el of list) {
            const path = el.split(":")[0];
            if (path.includes("/")) {
                const arr = path.split("/");
                let pathZip = "";
                for (let i = 0; i < arr.length - 1; i++) {
                    pathZip = pathZip + arr[i] + "/";
                }
                zip.addLocalFile(process.cwd().replace(/\\/g, "/") + "/" + path, pathZip);
            } else {
                zip.addLocalFile(process.cwd().replace(/\\/g, "/") + "/" + path);
            }
        }
        // write everything to disk
        zip.writeZip(process.cwd().replace(/\\/g, "/") + "/../pinesuExport.zip");
    },

    loadTree: () => {
        if (fs.existsSync(__dirname + '/../merkles/merkleCalendar.json')) {
            const mcFile = fs.readFileSync(__dirname + '/../merkles/merkleCalendar.json', 'utf8');
            if(mcFile.length !== 0){
                return ethLogic.deserializeMC(mcFile);
            }
        }
        return ethLogic.returnEmptyMC();
    },

    saveTree: (mc) => {
        try {
            const mcString = ethLogic.serializeMC(mc);
            fs.writeFileSync(__dirname + '/../merkles/merkleCalendar.json', mcString);
        } catch (err) {
            console.log('There has been an error parsing your JSON.')
            console.log(err);
        }
    },

    loadSG: () => {
        const sg = [];
        let sgList;
        if (fs.existsSync(__dirname + '/../merkles/storageGroup.json')) {
            const sgFile = fs.readFileSync(__dirname + '/../merkles/storageGroup.json', 'utf8');
            if (typeof (sgFile) !== "undefined" && sgFile !== "") {
                sgList = JSON.parse(sgFile);
                for (let el of sgList) {
                    if (el.hasOwnProperty("hash")) {
                        sg.push(el);
                    }
                }
            }
        }
        return sg;
    },

    saveSG: (sg) => {
        try {
            fs.writeFileSync(__dirname + '/../merkles/storageGroup.json', JSON.stringify(sg));
        } catch (err) {
            console.log('There has been an error parsing your JSON.')
            console.log(err);
        }
    }

};
