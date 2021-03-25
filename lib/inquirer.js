const inquirer = require('inquirer')

module.exports = {

  startAction: () => {
    const questions = [
      {
        type: 'list',
        name: 'startans',
        message: 'Welcome to PineSU, choose the operation to perform',
        choices: [ 'Create new SU / Register SU to your account', 'Register SU in the blockchain network', 'Check SU integrity', 'Export files from current SU', 'Check files integrity', 'Get / Change identity', 'Exit' ],
        default: 'Create new SU'
      }
    ];
    return inquirer.prompt(questions);
  },

  chooseUsername: () => {
    const questions = [
      {
        type: 'input',
        name: 'username',
        default: null,
        message: 'Enter your username:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a username';
          }
        }
      },
      {
        type: 'input',
        name: 'hash',
        default: 'null',
        message: 'Enter the ID md5 hash you want to use (optional, type \'null\' to generate a new one):',
        validate: function( value ) {
          if (value.length >= 16 || value === 'null') {
            return true;
          } else {
            return 'Please enter a ID hash (or type \'null\' to generate a new one)';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  changeUsername: () => {
    const questions = [
      {
        type: 'list',
        name: 'userchange',
        message: 'Would you like to change it?',
        choices: [ 'Yes', 'No' ],
        default: 'No'
      }
    ];
    return inquirer.prompt(questions);
  },

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

  askRegSU: (sulist) => {
    
    const questions = [
      {
        type: 'checkbox',
        name: 'register',
        message: 'Select the Storage Units you want to include in the blockchain registration:',
        choices: sulist
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
  },

  resetSU: () => {

    const questions = [
      {
        type: 'list',
        name: 'reset',
        message: 'This directory is already a Storage Unit. Do you wish to reset and recalculate it?',
        choices: [ 'Yes', 'No' ],
        default: 'Yes'
      }
    ];
    return inquirer.prompt(questions);

  },

  askSURecalc: (filelist) => {
    
    const questions = [
      {
        type: 'checkbox',
        name: 'recalc',
        message: 'Select the Storage Units you want to exclude by the recalculation:',
        choices: filelist
      }
    ];
    return inquirer.prompt(questions);
  },

  askSUExport: (filelist) => {
    
    const questions = [
      {
        type: 'checkbox',
        name: 'export',
        message: 'Select the files you would like to distribute:',
        choices: filelist
      }
    ];
    return inquirer.prompt(questions);
  },

  prova: (s) => {
    
    const questions = [
      {
        type: 'list',
        name: 'recalc',
        message: process.cwd().replace(/\\/g, "/")+"/"+' '+s,
        choices: [ 'Yes', 'No' ],
        default: 'Yes'
      }
    ];
    return inquirer.prompt(questions);
  },

};
