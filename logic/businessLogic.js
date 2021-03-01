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

function commitSU(){
    git.commit("",false);
}

function commitSU(_msg){
    git.commit(_msg,true);
}

function calculateSU(){
    var list;
    var tree;
    git.getRepoFiles((res) => list = res)
        .then(tree = treelist.createHashLists(list))
        .then(saveJSON(tree));
}

function saveJSON(_tree){
    const jsonContent = JSON.stringify(_tree);
 
    fs.writeFile(__dirname+"\\.pinesu\\filetree.json", jsonContent, 'utf8', function (err) {
       if (err) {
          return console.log(err);
       }
 
       console.log("The file was saved!");
       return;
    }); 
 }