const fs = require('fs');
const path = require('path');
var mkdirp = require('mkdirp');

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  saveJSON: (obj,desc) => {

    mkdirp('.pinesu', function(err) { 

      const jsonContent = JSON.stringify(obj);
 
      fs.writeFile(".pinesu/"+desc+".json", jsonContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
  
        console.log("The file was saved!");
        return;
      }); 
  
    });

  },

  createGitignore: async () => {
    const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

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
