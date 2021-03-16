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
    res = treelist.createCompSubArray(".pinesu",res.split(/\r?\n/));
    var hashed = treelist.createHashTree(res);
    files.saveJSON(hashed,"filetree");
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