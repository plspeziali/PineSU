const fs = require('fs');
var mkdirp = require('mkdirp');
var git = new GitConnector(".");
var treelist = new TreeList();


function changeDir(dir){
    git = new GitConnector(dir);
}

function init(){
    git.init();
    mkdirp(__dirname+'\\.pinesu', function(err) {});
}

function addFileSU(_file){
    git.add(_file);
}

function addAllSU(){
    git.add();
}

function commitSU(_msg){
    if(typeof msg === undefined || msg === ""){
        git.commit("",false);
    } else {
        git.commit(_msg,true);
    }
}

function calculateSU(){
    var list;
    var tree;
    git.getRepoFiles((res) => list = res)
        .then(tree = treelist.createHashLists(list))
        .then(saveJSON(tree,"filetree"));
}

module.exports = {
    changeDir: changeDir,
    init: init,
    addAllSU: addAllSU,
    addFileSU: addFileSU,
    commitSU: commitSU,
    calculateSU: calculateSU
}