const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');
const touch = require('touch');
var _und = require("underscore");
var crypto = require('crypto');
const inquirer = require('./inquirer');
const hidefile = require('hidefile');
var AdmZip = require('adm-zip');

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  /*createPineSUFile: () => {
    if(!fs.existsSync(process.cwd()+"/.pinesu.json")){
      mkdirp.sync(process.cwd()+"/pinesu");
      hidefile.hideSync(process.cwd()+"/pinesu");
    }
  },*/

  writeID: (_user, _hash, _sulist) => {
    var hashid = _hash;
    if(_hash == 'null'){
      hashid = crypto.createHash('md5').update(_user+require('macaddress').one()+"", 'utf8').digest('hex');
    }

    
    if(typeof(_sulist) === "undefined" || !Array.isArray(_sulist) || _sulist.length == 0 || _sulist[0] == "null"){
      _sulist = new Array();
    } else if(_sulist[0] == "no-change"){
      var data = fs.readFileSync(path.resolve(__dirname+'/..', 'config.json'));
      try {
        var myObj = JSON.parse(data);
        _sulist = myObj.sulist;
      } catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    }
    
    var myOptions = {
      username: _user,
      id: hashid,
      sulist: _sulist
    };
    
    var data = JSON.stringify(myOptions);
    
    fs.writeFileSync(path.resolve(__dirname+'/..', 'config.json'), data);
  },

  readID: () => {
    if(fs.existsSync(path.resolve(__dirname+'/..', 'config.json'))){
      var data = fs.readFileSync(path.resolve(__dirname+'/..', 'config.json'));
      try {
        var myObj = JSON.parse(data);
        if(typeof(myObj.id) === "undefined" || myObj.id === "null"){
          if(typeof(myObj.username) === "undefined" || myObj.username === "null"){
            return {username: "null", id: "null"};
          } else {
            module.exports.writeID(myObj.username, 'null', ['null']);
            return module.exports.readID();
          }
        }
        return myObj;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    }else{
      return {username: "null", id: "null"};
    }
  },

  addToUser: (_userhash, _project, _hash) => {
    var data = fs.readFileSync(path.resolve(__dirname+'/..', 'config.json'));
    try {
      var myObj = JSON.parse(data);
      if(typeof(myObj.sulist) === "undefined" || !Array.isArray(myObj.sulist) || myObj.sulist.length == 0){
        var sulist = new Array();
      } else {
        sulist = myObj.sulist.slice();
      }
      if(!sulist.includes(_project+":"+_hash+":"+_userhash)){
        sulist.push(_project+":"+_hash+":"+_userhash);
      }
      module.exports.writeID(myObj.username, _userhash, sulist);
    }
    catch (err) {
      console.log('There has been an error parsing your JSON.');
      console.log(err);
    }
    /*var data = fs.readFileSync(path.resolve(process.cwd()+"/.pinesu/", 'filetree.json'));
    try {
      var d1 = String(data).substring('[root'.length)
      fs.writeFileSync(path.resolve(process.cwd()+"/.pinesu/filetree.json"), '{"'+_project+d1);
    }
    catch (err) {
      console.log('There has been an error parsing your JSON.');
      console.log(err);
    }*/
  },

  readSUList: () => {
    
    if(fs.existsSync(path.resolve(__dirname+'/..', 'config.json'))){
      var data = fs.readFileSync(path.resolve(__dirname+'/..', 'config.json'));
      try {
        var myObj = JSON.parse(data);
        if(typeof(myObj.sulist) === "undefined" || !Array.isArray(myObj.sulist) || myObj.sulist.length == 0){
          return ["null"];
        }
        return myObj.sulist;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    }

  },

  saveJSON: async (obj,desc) => {
    
    const jsonContent = JSON.stringify(obj);

    fs.writeFile(process.cwd()+"/.pinesu.json", jsonContent, 'utf8', function (err) {
      if (err) {
          return console.log(err);
      }
      //hidefile.hideSync(process.cwd()+"/.pinesu.json");
      return;
    }); 

  },

  createGitignore: async () => {
    const filelist = _und.without(fs.readdirSync(process.cwd()), '.git', '.gitignore');

    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);

      if (answers.ignore.length) {
        fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) );
      } else {
        touch( '.gitignore' );
      }
    } else {
      touch('.gitignore');
    }
  },

  readPineSUFile: (el) => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/"+el)){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/"+el);
      try {
        var myObj = JSON.parse(data);
        var o = {
          name: myObj.name,
          owner: myObj.owner,
          hash: myObj.hash,
          path: el,
          filelist: myObj.filelist
        };
        return o;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return ["null"];
    }
  },

  readPineSU: (list) => {
    var res = [];
    for(var el of list){
      var myObj = module.exports.readPineSUFile(el);
      //var data = JSON.stringify(myObj);
      //fs.writeFileSync(path.resolve(__dirname+'/..', 'prova.json'), data);
      res.push(myObj);
    }
    return res.slice();
  },

  distributeSU: async () => {

    var filelist = module.exports.readPineSUFile(".pinesu.json").filelist;
    for(let i = 0; i < filelist.length; i++){
      el = filelist[i].split(":")[0];
      if(el.includes("pinesu.json") || el.includes(".gitignore") || fs.lstatSync(el).isDirectory() ){
        filelist.splice(i,1);
      }
    }

    if(filelist[0] !== "null"){
      if (filelist.length) {
        const answers = await inquirer.askSUExport(filelist);
  
        if (answers.export.length) {
          return answers.export;
        }
      }
    }
    return ["null"];
  },

  createZIP: (list, json) => {
    var zip = new AdmZip();
	
    // add file directly
    var content = JSON.stringify(json);
    zip.addFile(".pifiles.json", Buffer.alloc(content.length, content));
    // add local file
    for(var el of list){
      var path = el.split(":")[0];
      if(path.includes("/")){
        var arr = path.split("/").splice();
        var folderpath=""
        for(var i = 0; i < arr.length-1; i++){
          console.log(arr[i])
          folderpath += arr[i]+"/"
          zip.addFile(folderpath,null)
        }
      }
      zip.addLocalFile(process.cwd().replace(/\\/g, "/")+"/"+el.split(":")[0]);
    }
    // write everything to disk
    zip.writeZip(process.cwd().replace(/\\/g, "/")+"/pinesuExport.zip");
  }

};
