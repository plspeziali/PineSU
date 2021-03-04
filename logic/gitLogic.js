const fs = require('fs');
var mkdirp = require('mkdirp');
var GitConnector = require('../connectors/gitConnector');
var git = new GitConnector('.');
var TreeListC = require('../lib/treelist');
var treelist = new TreeListC();
const files = require('../lib/files');

function changeDir(dir){
    git = new GitConnector(dir);
}

function init(){
    git.init();
}

function addFileSU(_file){
    git.add(_file);
}

function addAllSU(){
    git.add();
}

async function commitSU(_msg){
    if(typeof msg === 'undefined' || msg === ""){
        return await git.commit("",false);
    } else {
        return await git.commit(_msg,true);
    }
}

async function calculateSU(){
    var res = await git.getRepoFiles();
    res = treelist.createCompSubArray(".pinesu",res.split("\n"));
    files.saveJSON(treelist.createHashTree(res),"filetree");
}

module.exports = {
    changeDir: changeDir,
    init: init,
    addAllSU: addAllSU,
    addFileSU: addFileSU,
    commitSU: commitSU,
    calculateSU: calculateSU
}