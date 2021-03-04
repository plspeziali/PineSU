const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');
const touch = require('touch');
var _und = require("underscore");
const inquirer = require('./inquirer');

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  saveJSON: (obj,desc) => {

    mkdirp(process.cwd()+"/.pinesu").then(made =>{ 
      console.log(made);
      const jsonContent = JSON.stringify(obj);
 
      fs.writeFile(made+"/"+desc+".json", jsonContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
  
        console.log("The file was saved!");
        return;
      }); 
  
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
