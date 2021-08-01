const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');
const touch = require('touch');
var _und = require("underscore");
//var crypto = require('crypto');
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
    var openRoot = "null";
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
    var closedRoot = "null";
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

  /*createPineSUFile: () => {
    if(!fs.existsSync(process.cwd()+"/.pinesu.json")){
      mkdirp.sync(process.cwd()+"/pinesu");
      hidefile.hideSync(process.cwd()+"/pinesu");
    }
  },*/

  /*writeID: (_user, _hash, _sulist) => {
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
  },*/

  /*addToUser: (_userhash, _project, _suinfo) => {
    var hash =  crypto.createHash('sha1').update(JSON.stringify(_suinfo), 'utf8').digest('hex');
    var data = fs.readFileSync(path.resolve(__dirname+'/..', 'config.json'));
    try {
      var myObj = JSON.parse(data);
      if(typeof(myObj.sulist) === "undefined" || !Array.isArray(myObj.sulist) || myObj.sulist.length == 0){
        var sulist = new Array();
      } else {
        sulist = myObj.sulist.slice();
      }
      if(!sulist.includes(_project+"::"+hash+"::"+process.cwd().replace(/\\/g, "/"))){
        sulist.push(_project+"::"+hash+"::"+process.cwd().replace(/\\/g, "/"));
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
    }
  },*/

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
    try {
      fs.writeFileSync(process.cwd().replace(/\\/g, "/")+"/registration.json", JSON.stringify(el));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  },

  closePineSUFile: (el) => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/"+el)){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/"+el);
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
      return ["null"];
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
          closed: myObj.closed,
          path: el,
          //pinesuhash: crypto.createHash('sha1').update(JSON.stringify(myObj), 'utf8').digest('hex'),
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

  isClosed: () => {
    if(fs.existsSync('.pinesu.json')){
      var myObj = module.exports.readPineSUFile('.pinesu.json');
      return myObj.closed;
    }
    return false;
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

  readPifiles: () => {
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

    var pinesu = module.exports.readPineSUFile(".pinesu.json");
    
    if(pinesu[0] == "null"){
      return ["null"];
    }

    var filelist = pinesu.filelist;

    for(let i = 0; i < filelist.length; i++){
      el = filelist[i].split(":")[0];
      if(typeof(el) == "undefined" || el.includes(".pinesu.json") || el.includes(".gitignore") || fs.lstatSync(process.cwd().replace(/\\/g, "/")+"/"+el).isDirectory()){
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

  /*writeHashes: (list) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;

    var res = []
    if(list.length == 1){
      var el = list[0];
      res.push({
        hash: el.split("::")[1],
        name: el.split("::")[0],
        proof: "null"
      });
      res.push({
        hash: el.split("::")[1],
        name: today,
        proof: "null"
      });
      var registration = {
        hash: el.split("::")[1],
        name: el.split("::")[0],
        proof: "null",
        root: el.split("::")[1],
        date: today
      }
      fs.writeFileSync(path.resolve(el.split("::")[2], '.registration.json'), JSON.stringify(registration));
    } else if (list.length > 1) {
      var hashlist = [];
      for(el of list){
        hashlist.push(el.split("::")[1]);
      }
      var root = treelist.calculateTree(hashlist);
      for(el of list){
        res.push({
          hash: el.split("::")[1],
          name: el.split("::")[0],
          proof: treelist.getProof(el.split("::")[1])
        });
        var registration = {
          hash: el.split("::")[1],
          name: el.split("::")[0],
          proof: treelist.getProof(el.split("::")[1]),
          root: root,
          date: today
        }
        fs.writeFileSync(path.resolve(el.split("::")[2], '.registration.json'), JSON.stringify(registration));  
      }
      res.push({
        hash: root,
        name: today,
        proof: "null"
      });
    } else {
      return;
    }

    fs.writeFileSync(path.resolve(__dirname+'/../dapp/src', 'latest_hashes.json'), JSON.stringify(res));

    execSync('opener http://localhost:3000',{stdio: 'inherit'});

    /*if(fs.existsSync(path.resolve(__dirname+'/..', 'registrations.json'))){
      var data = fs.readFileSync(path.resolve(__dirname+'/..', 'registrations.json'));
    } else {
      var data =  [];
    }

    data.push(res);

    fs.writeFileSync(path.resolve(__dirname+'/..', 'registrations.json'), JSON.stringify(data));

  },*/

  /*checkRegistration: (hash) => {
    if(fs.existsSync(process.cwd().replace(/\\/g, "/")+"/.registration.json")){
      var data = fs.readFileSync(process.cwd().replace(/\\/g, "/")+"/.registration.json");
      try {
        var myObj = JSON.parse(data);
        inquirer.prova(myObj.hash+" "+hash)
        if(myObj.hash == hash){
          if(myObj.hash == myObj.root){
            return true;
          } else {
            if(treelist.validateProof(myObj.proof,myObj.hash,myObj.root)){
              return true;
            } else {
              return false;
            }
          }
        } else {
          return false;
        } 
      } catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
      }
    } else {
      return false;
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
  },*/

  createZIP: (list, json) => {
    var zip = new AdmZip();
	
    // add file directly
    var content = JSON.stringify(json);
    zip.addFile(".pifiles.json", Buffer.alloc(content.length, content));
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
        closedFile = fs.readFileSync(__dirname+'/../merkles/closed.json', 'utf8');
        var openA = JSON.parse(openFile);
        var closedA = JSON.parse(closedFile);
        if(o != null){
          for(var o of openA){
            mc.addRegistration(o.name, o.hash, o.date, false)
          }
        }
        if(c != null){
          for(var c of closedA){
            mc.addRegistration(c.name, c.hash, c.date, true)
          }
        }
    };
    return mc;
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
  },

  saveTree: (mc) => {
    try {
      [openA, closedA] = mc.getLeaves();
      fs.writeFileSync(__dirname+'/../merkles/open.json', JSON.stringify(openA));
      fs.writeFileSync(__dirname+'/../merkles/closed.json', JSON.stringify(closedA));
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  }

};
