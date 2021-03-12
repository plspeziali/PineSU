const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');
const touch = require('touch');
var _und = require("underscore");
var crypto = require('crypto');
const inquirer = require('./inquirer');
const hidefile = require('hidefile');

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  createPineSUDir: () => {
    if(!fs.existsSync(process.cwd()+"/.pinesu")){
      mkdirp.sync(process.cwd()+"/pinesu");
      hidefile.hideSync(process.cwd()+"/pinesu");
    }
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
            this.writeID(myObj.username);
            return this.readID();
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

  writeID: (_user) => {
    var myOptions = {
      username: _user,
      id: crypto.createHash('md5').update(_user+require('macaddress').one()+"", 'utf8').digest('hex'),
    };
    
    var data = JSON.stringify(myOptions);
    
    fs.writeFileSync(path.resolve(__dirname+'/..', 'config.json'), data);
  },

  saveJSON: async (obj,desc) => {
    
    const jsonContent = JSON.stringify(obj);

    fs.writeFile(process.cwd()+"/.pinesu/"+desc+".json", jsonContent, 'utf8', function (err) {
      if (err) {
          return console.log(err);
      }
      return;
    }); 

  },

  createGitignore: async () => {
    const filelist = _und.without(fs.readdirSync('.'), '.git', '.gitignore');

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
  }

};
