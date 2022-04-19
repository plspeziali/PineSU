const GitConnector = require('../connectors/gitConnector');
let git = new GitConnector(process.cwd());
const treelist = require('../lib/treelist');
const files = require('../lib/files');

module.exports = {

    changeDir(dir) {
        git = new GitConnector(dir);
    },

    init() {
        git.init();
    },

    async addFileSU(_file) {
        await git.add(_file);
    },

    async addAllSU() {
        await git.add();
    },

    async commitSU(_msg) {
        if (typeof (_msg) === 'undefined' || _msg === "") {
            return await git.commit("", false);
        } else {
            return await git.commit(_msg, true);
        }
    },

    async addRemoteSU(_repo) {
        return await git.addRemote(_repo);
    },

    async pushSU() {
        return git.push();
    },

    async customGit(command) {
        return git.custom(command.split(" "));
    },

    resetCommit() {
        git.reset();
    },

    async hasRemote() {
        return await git.hasRemote();
    },

    async getRemote() {
        return await git.getRemote();
    },

    async setRemote(url) {
        return await git.setRemote(url);
    },

    async checkCommitMessages() {
        let list = await git.log();
        console.log(list);
        if (list.hasOwnProperty("all")) {
            list = list.all;
        }
        for (let el of list) {
            if (el.message === "The Storage Unit is now closed") {
                return false;
            }
        }
        return true;
    },

    async calculateSU() {
        let res = [];
        files.getFilelist("",res);
        for(let el of res){
            el = el.replace(/\\\\/g, '/');
        }
        return treelist.createHashTree(res);
    },

    calculateTree(list) {
        const hashlist = [];
        let elsplit;
        let el;
        for (el of list) {
            elsplit = el.split(':');
            hashlist.push(elsplit[1]);
        }
        return treelist.calculateTree(hashlist);
    },

    createFilesJSON(list) {
        const pinesufile = files.readPineSUFile();
        let root = pinesufile.hash;
        const owner = pinesufile.owner;
        if (!treelist.sameRoot(root)) {
            root = module.exports.calculateTree(pinesufile.filelist);
        }
        const res = [];
        let el;
        for (el of list) {
            const o = {
                path: el.split(":")[0],
                hash: el.split(":")[1],
                owner: owner,
                root: root,
                proof: treelist.getProof(el.split(":")[1])
            };
            res.push(o);
        }
        return res;
    },

    validateProof(proof, hash, root) {
        return treelist.validateProof(proof, hash, root);
    },

    fileHashSync(path) {
        return treelist.fileHashSync(path);
    },

    async makeRegistrationCommit(path) {
        this.changeDir(path);
        await this.addFileSU(".registration.json");
        await this.commitSU();
    },

    calculateRealHash(date, hash) {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        return treelist.combineHash(year, month, day, hour, minute, second, hash)
    }

}