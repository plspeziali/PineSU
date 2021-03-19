const fs = require('fs');
var mkdirp = require('mkdirp');
var GitConnector = require('../connectors/gitConnector');
var git = new GitConnector(process.cwd());
var TreeListC = require('../lib/treelist');
var treelist = new TreeListC();
const files = require('../lib/files');
const inquirer = require('../lib/inquirer');

function changeDir(dir){
    git = new GitConnector(dir);
}

function init(){
    git.init();
}

async function addFileSU(_file){
    await it.add(_file);
}

async function addAllSU(){
    await git.add();
}

async function commitSU(_msg){
    if(typeof msg === 'undefined' || msg === ""){
        return await git.commit("",false);
    } else {
        return await git.commit(_msg,true);
    }
}

async function addRemoteSU(_repo){
    return await git.addRemote(_repo);
}

async function pushSU(){
    return git.push();
}

function resetCommit(){
    git.reset();
}

async function hasRemote(){
    return await git.hasRemote;
}

async function calculateSU(){
    var res = await git.getRepoFiles();
    res = res.split(/\r?\n/);
    var pinesulist = treelist.createSubArray(".pinesu.json",res);
    if(typeof(pinesulist) !== "undefined" && pinesulist.length > 0){
        if(pinesulist.length > 1 || (pinesulist.length == 1 && pinesulist[0] !== ".pinesu.json")){
            var pinesuArray = files.readPineSU(pinesulist);
            await inquirer.prova(pinesulist);
            var inqlist = new Array();
            for(el in pinesuArray){
                inqlist.push(el.name+":"+el.path)
            }
            var inqrec = await inquirer.askSURecalc(inqlist);
            if(typeof(inqrec.recalc) !== "undefined" && inqrec.recalc.length > 0){
                for(el in inqrec.recalc){
                    var sufile = files.readPineSUFile(el.split(":")[1]);
                    sufile.path = sufile.path.substring(0,".pinesu.json".length);
                    // sostituisco la root
                    res = treelist.createCompSubArray(sufile.path, res);
                    res.push(sufile.path+":"+sufile.hash);
                    // sostituisco tutti
                    for(suel in sufile.sulist){
                        res.push(sufile.path+"/"+suel);
                    }
                }
            }
        } else {
            const answer = await inquirer.resetSU();
            if (answer.reset == "No") {
                return ["null"];
            }
        }
    }
    var hashed = treelist.createHashTree(res);
    return hashed;
}

module.exports = {
    changeDir: changeDir,
    init: init,
    addAllSU: addAllSU,
    addFileSU: addFileSU,
    commitSU: commitSU,
    calculateSU: calculateSU,
    addRemoteSU: addRemoteSU,
    pushSU: pushSU,
    resetCommit: resetCommit,
    hasRemote: hasRemote
}