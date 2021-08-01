const fs = require('fs');
var mkdirp = require('mkdirp');
var GitConnector = require('../connectors/gitConnector');
var git = new GitConnector(process.cwd());
var TreeListC = require('../lib/treelist');
var treelist = new TreeListC();
const files = require('../lib/files');
const inquirer = require('../lib/inquirer');

module.exports = {

    changeDir(dir){
        git = new GitConnector(dir);
    },

    init(){
        git.init();
    },

    async addFileSU(_file){
        await it.add(_file);
    },

    async addAllSU(){
        await git.add();
    },

    async commitSU(_msg){
        if(typeof msg === 'undefined' || msg === ""){
            return await git.commit("",false);
        } else {
            return await git.commit(_msg,true);
        }
    },

    async addRemoteSU(_repo){
        return await git.addRemote(_repo);
    },

    async pushSU(){
        return git.push();
    },

    async customGit(command){
        return git.custom(command.split(" "));
    },

    resetCommit(){
        git.reset();
    },

    async hasRemote(){
        return await git.hasRemote;
    },

    async calculateSU(){
        var res = await git.getRepoFiles();
        res = res.split(/\r?\n/);
        /*var pinesulist = treelist.createSubArray(".pinesu.json",res);
        //await inquirer.prova(res);
        if(typeof(pinesulist) !== "undefined" && pinesulist.length > 0){
            if(pinesulist.length > 1 || (pinesulist.length == 1 && pinesulist[0] !== ".pinesu.json")){
                var pinesuArray = files.readPineSU(pinesulist);
                var inqlist = new Array();
                for(var el of pinesuArray){
                    inqlist.push(el.name+":"+el.path)
                }
                var inqrec = await inquirer.askSURecalc(inqlist);
                if(typeof(inqrec.recalc) !== "undefined" && inqrec.recalc.length > 0){
                    for(var el of inqrec.recalc){
                        var sufile = files.readPineSUFile(el.split(":")[1]);
                        var rootpath = sufile.path.substring(0,sufile.path.length - "/.pinesu.json".length);
                        // sostituisco la root
                        res = treelist.createCompSubArray(rootpath, res);
                        res.push(rootpath+":"+sufile.hash);
                        // sostituisco tutti
                        for(suel of sufile.filelist){
                            res.push(rootpath+"/"+suel);
                        }
                    }
                }
            } else {
                const answer = await inquirer.resetSU();
                if (answer.reset == "No") {
                    return ["null"];
                }
            }
        }*/
        res = res .filter(e => e !== '.gitignore');
        res = res .filter(e => e !== '.registration.json');
        res = res .filter(e => e !== '.pinesu.json');
        var hashed = treelist.createHashTree(res);

        return hashed;
    },

    calculateTree(list){
        //inquirer.prova(list);
        var hashlist = [];
        for(el of list){
            elsplit = el.split(':');
            hashlist.push(elsplit[1]);
        }
        //inquirer.prova(list + " /// " + hashlist);
        return treelist.calculateTree(hashlist);
    },

    createFilesJSON(list){
        var pinesufile = files.readPineSUFile(".pinesu.json");
        var root = pinesufile.hash;
        var owner = pinesufile.owner;
        if(!treelist.sameRoot(root)){
            root = module.exports.calculateTree(pinesufile.filelist);
        }
        var res = []
        for(el of list){
            var o = {
                path: el.split(":")[0],
                hash: el.split(":")[1],
                owner: owner,
                root: root,
                proof: treelist.getProof(el.split(":")[1])
            }
            res.push(o);
        }
        return res;
    },

    validateProof(proof, hash, root){
        return treelist.validateProof(proof, hash, root);
    },

    fileHashSync(path){
        return treelist.fileHashSync(path);
    },

    async makeCommit(path){
        this.changeDir(path);
        await this.addAllSU();
        await this.commitSU();
    }

}