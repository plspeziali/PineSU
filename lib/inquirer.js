const inquirer = require('inquirer')

module.exports = {

  gitSetup: () => {
    const questions = [
      {
        type: 'list',
        name: 'gitinit',
        message: 'Initialize a git repository in the current directory?',
        choices: [ 'Yes', 'No' ],
        default: 'Yes'
      }
    ];
    return inquirer.prompt(questions);
  },

  gitAdd: () => {
    const questions = [
      {
        type: 'list',
        name: 'gitignore',
        message: 'PineSU will now proceed to create a commit with all the files and\n'
        +'subdirectories inside this directory, do you wish to exclude\nsome of them with a .gitignore?',
        choices: [ 'Yes', 'No' ],
        default: 'No'
      }
    ];
    return inquirer.prompt(questions);
  },

  askIgnoreFiles: (filelist) => {
    
    const questions = [
      {
        type: 'checkbox',
        name: 'ignore',
        message: 'Select the files and/or folders you wish to ignore:',
        choices: filelist,
        default: ['node_modules', 'bower_components']
      }
    ];
    return inquirer.prompt(questions);
  },
  
  gitCommit: () => {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a commit message:',
        default: "[Commit # by PineSU]",
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a commit message';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askSUDetails: (name) => {

    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the Storage Unit:',
        default: name,
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a name for the Storage Unit.';
          }
        }
      },
      {
        type: 'input',
        name: 'description',
        default: null,
        message: 'Optionally enter a description of the Storage Unit:'
      },
      {
        type: 'list',
        name: 'visibility',
        message: 'Public or private:',
        choices: [ 'public', 'private' ],
        default: 'public'
      },
      {
        type: 'input',
        name: 'date',
        message: 'Enter the date of registration of the Storage Unit:',
        default: (new Date()).toISOString().slice(0,10),
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the date of registration of the Storage Unit.';
          }
        }
      },
    ];
    return inquirer.prompt(questions);
  }
};
