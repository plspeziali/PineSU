const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');
const touch = require('touch');
var _und = require("underscore");
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
