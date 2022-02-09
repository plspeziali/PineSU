const fs = require('fs');
const path = require('path');
const touch = require('touch');
var _und = require("underscore");
const inquirer = require('./inquirer');
var TreeListC = require('../lib/treelist');
var treelist = new TreeListC();
const hidefile = require('hidefile');
var AdmZip = require('adm-zip');
const {execSync} = require('child_process');
const MerkleCalendar = require('../lib/merkleCalendar');

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

  readWallet: async () => {
    if(fs.existsSync(__dirname+'/../config.json')){
      var data = fs.readFileSync(__dirname+'/../config.json');
      return JSON.parse(data);
    } else {
      return module.exports.writeWallet();
    }
  },

  writeWallet: async () => {
    const answers = await inquirer.chooseAddresses();
    var o = {
      wallet1: answers.wallet1,
      wallet2: answers.wallet2,
      pkey: answers.pkey
    };
    fs.writeFileSync(__dirname+'/config.json', JSON.stringify(o));
    return o;
  },

  createSGTrees: (sg) => {
    var open = new Array();
    var openHashes = new Array();
    var closed = new Array();
    var closedHashes = new Array();
    for(var el of sg){
        if(el.closed){
            closed.push(el);
            closedHashes.push(el.hash);
        } else {
            open.push(el);
            openHashes.push(el.hash);
        }
    }
    var document = new Array();
    var openRoot = null;
    if(openHashes.length != 0){
      openRoot = treelist.calculateTree(openHashes);
    }
    for(var el of open){
      var o = {
        path: el.path,
        root: openRoot,
        proof: treelist.getProof(el.hash),
        transactionHash: null,
      }
      document.push(o);
    }
    var closedRoot = null;
    if(closedHashes.length != 0){
      closedRoot = treelist.calculateTree(closedHashes);
    }
    for(var el of closed){
      var o = {
        path: el.path,
        root: closedRoot,
        proof: treelist.getProof(el.hash),
        transactionHash: null,
      }
      document.push(o);
    }
    return [document, openRoot, closedRoot];
  },

  flushSG: () => {
    module.exports.saveSG(new Array());
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

  saveJSON: async (obj) => {

    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pinesu.json")){
      var content = module.exports.readPineSUFile();
      if(!fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/")){
        fs.mkdirSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/");
        hidefile.hideSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/");
      }
      var contentJSON = JSON.stringify(content);
      fs.writeFileSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/pinesu"+content.date+"_"+content.hash+".json", contentJSON);
    }
    
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

  createRegistration: (el) => {
    
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.registration.json")){
      var content = module.exports.readRegistrationFile();
      if(!fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/")){
        fs.mkdirSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/");
        hidefile.hideSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/");
      }
      var contentJSON = JSON.stringify(content);
      fs.writeFileSync(process.cwd().replace(/\\/g, "/")+"/.pinesu_old/registration"+content.date+"_"+content.root+".json", contentJSON);
    }

    try {
      fs.writeFileSync(el.path+"/.registration.json", JSON.stringify(el));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  },

  closePineSUFile: () => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pinesu.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/.pinesu.json");
      try {
        var myObj = JSON.parse(data);
        myObj.closed = true;
        fs.writeFileSync('.pinesu.json', JSON.stringify(myObj));
        return myObj;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return [null];
    }
  },

  readPineSUFile: () => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pinesu.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/.pinesu.json");
      try {
        var myObj = JSON.parse(data);
        return myObj;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return ["null"];
    }
  },

  readRegistrationFile: () => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.registration.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/.registration.json");
      try {
        var myObj = JSON.parse(data);
        return myObj;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return ["null"];
    }
  },

  isClosed: () => {
    if(fs.existsSync('.pinesu.json')){
      var myObj = module.exports.readPineSUFile();
      return myObj.closed;
    }
    return false;
  },

  readPifile: () => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.pifiles.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/"+"/.pifiles.json");
      try {
        var myObj = JSON.parse(data);
        return myObj;
      }
      catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return ["null"];
    }
  },

  distributeSU: async () => {
    var pinesu = module.exports.readPineSUFile();
    
    if(pinesu[0] == "null"){
      return ["null"];
    }

    var filelist = pinesu.filelist;
    var finallist = new Array();
    for(let i = 0; i < filelist.length; i++){
      el = filelist[i].split(":")[0];
      if(typeof(el) == "undefined" || el.includes(".pinesu.json") || el.includes(".gitignore") || fs.lstatSync(el).isDirectory()){
        
      } else {
        finallist.push(filelist[i])
      }
    }

    if(finallist[0] !== "null"){
      if (finallist.length) {
        const answers = await inquirer.askSUExport(finallist);
  
        if (answers.export.length) {
          return answers.export;
        }
      }
    }
    return ["null"];
  },

  checkRegistration: (hash) => {
    if(fs.existsSync(".registration.json")){
      var data = fs.readFileSync(".registration.json");
      try {
        var myObj = JSON.parse(data);
        //inquirer.prova(myObj.root+" "+hash)
        if(hash == myObj.root){
          return [true,myObj];
        } else {
          //console.log([myObj.proof,hash,myObj.root])
          if(treelist.validateProof(myObj.proof,hash,myObj.root)){
            return [true,myObj];
          } else {
            return [false,null];
          }
        }
      } catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return [false,null];
    }
  },

  blockchainCheck: () => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.registration.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/.registration.json");
      try {
        var myObj = JSON.parse(data);
        fs.writeFileSync(path.resolve(__dirname+'/../dapp/src', 'hash_to_check.json'), JSON.stringify(myObj.root));
        execSync('opener http://localhost:3000/check.html',{stdio: 'inherit'});

      } catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    }
  },

  createZIP: (list, json) => {
    var zip = new AdmZip();
	
    // add file directly
    var content = JSON.stringify(json);
    zip.addFile(".pifiles.json", Buffer.alloc(content.length, content));
    if(fs.existsSync(".registration.json")){
      zip.addLocalFile(".registration.json");
    }
    // add local file
    for(var el of list){
      var path = el.split(":")[0];
      if(path.includes("/")){
        var arr = path.split("/");
        var pathZip = "";
        for(let i=0; i<arr.length-1; i++){
          pathZip = pathZip+arr[i]+"/";
        }
        zip.addLocalFile(process.cwd().replace(/\\/g, "/")+"/"+path,pathZip);
      } else {
        zip.addLocalFile(process.cwd().replace(/\\/g, "/")+"/"+path);
      }
    }
    // write everything to disk
    zip.writeZip(process.cwd().replace(/\\/g, "/")+"/../pinesuExport.zip");
  },

  loadTree: () => {
    var mc = new MerkleCalendar();
    var openFile, closedFile;
    if(fs.existsSync(__dirname+'/../merkles/open.json')){
      openFile = fs.readFileSync(__dirname+'/../merkles/open.json', 'utf8');
      var openT = JSON.parse(openFile);
      for(var y of openT){
        for(var m of y.children){
          for(var l of m.children){
            mc.addRegistrationNC(l.name, l.hash, l.year, l.month, l.day, l.hour, l.minute, false, m.hash, y.hash);
          }
        }
      }
    };
    if(fs.existsSync(__dirname+'/../merkles/closed.json')){
      closedFile = fs.readFileSync(__dirname+'/../merkles/closed.json', 'utf8');
      var closedT = JSON.parse(closedFile);
      for(var y of closedT){
        for(var m of y.children){
          for(var l of m.children){
            mc.addRegistrationNC(l.name, l.hash, l.year, l.month, l.day, l.hour, l.minute, true, m.hash, y.hash);
          }
        }
      }
    };
    return mc;
  },

  saveTree: (mc) => {
    try {
      [openT, closedT] = mc.getTrees();
      fs.writeFileSync(__dirname+'/../merkles/open.json', JSON.stringify(openT));
      fs.writeFileSync(__dirname+'/../merkles/closed.json', JSON.stringify(closedT));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  },

  downloadTree: (r) => {
    try {
      [openT, closedT] = mc.getTrees();
      fs.writeFileSync(__dirname+'/../merkles/open.json', JSON.stringify(openT));
      fs.writeFileSync(__dirname+'/../merkles/closed.json', JSON.stringify(closedT));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  },

  loadSG: () => {
    var sg = new Array();
    if(fs.existsSync(__dirname+'/../merkles/storageGroup.json')){
        var sgFile = fs.readFileSync(__dirname+'/../merkles/storageGroup.json', 'utf8');
        if(typeof(sgFile) !== "undefined" && sgFile !== ""){
          sgList = JSON.parse(sgFile);
          for(var el of sgList){
            if(el.hasOwnProperty("hash")){
              sg.push(el);
            }
          }
        }
    }
    return sg;
  },

  saveSG: (sg) => {
    try {
      fs.writeFileSync(__dirname+'/../merkles/storageGroup.json', JSON.stringify(sg));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  }

};
