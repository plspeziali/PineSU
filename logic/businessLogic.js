const fs = require('fs');
var merkle = require('./lib/merkle.js');
var mkdirp = require('mkdirp');
var git = require('./connectors/gitConnector.js');
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

function init(){
    git.init();
    mkdirp('./.pinesu', function(err) {});
}

function commitSU(){

}

function pushSU(){

}


function calculateSU(){

}