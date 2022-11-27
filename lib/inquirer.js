const inquirer = require('inquirer')

module.exports = {

    startAction: () => {
        const questions = [
            {
                type: 'list',
                name: 'startans',
                message: 'Welcome to PineSU, choose the operation to perform',
                choices: ['create / update', 'stage', 'close', 'syncwbc', 'checkbc', 'checkfile', 'export', 'git', 'settings', 'help', 'exit'],
                default: 'create / update'
            }
        ];
        return inquirer.prompt(questions);
    },

    chooseAddresses: () => {
        const questions = [
            {
                type: 'input',
                name: 'wallet1',
                default: null,
                message: 'Enter your first wallet address:',
                validate: function (value) {
                    if (value.length >= 40) {
                        return true;
                    } else {
                        return 'Please enter a valid (at least 40 characters) wallet address';
                    }
                }
            },
            {
                type: 'input',
                name: 'pkey',
                default: null,
                message: 'Enter your first wallet\'s private key:',
                validate: function (value) {
                    if (value.length >= 64) {
                        return true;
                    } else {
                        return 'Please enter a valid (at least 64 characters) private key';
                    }
                }
            },
            {
                type: 'input',
                name: 'wallet2',
                default: null,
                message: 'Enter your second wallet address:',
                validate: function (value) {
                    if (value.length >= 40) {
                        return true;
                    } else {
                        return 'Please enter a valid (at least 40 characters) wallet address';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },

    isValidHttpUrl: (string) => {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    },

    changeAddresses: () => {
        const questions = [
            {
                type: 'list',
                name: 'addressChange',
                message: 'Would you like to change them?',
                choices: ['Yes', 'No'],
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
                choices: ['Yes', 'No'],
                default: 'Yes'
            }
        ];
        return inquirer.prompt(questions);
    },

    gitCustom: () => {
        const questions = [
            {
                type: 'input',
                name: 'command',
                message: 'Enter a Git command (omit "git" at the beginning):',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter a Git command';
                    }
                }
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
                    + 'subdirectories inside this directory, do you wish to exclude\nsome of them with a .gitignore?',
                choices: ['Yes', 'No'],
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
                validate: function (value) {
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

    ethHost: () => {
        const questions = [
            {
                type: 'input',
                name: 'host',
                message: 'Enter the address of the blockchain:',
                default: "HTTP://127.0.0.1:7545",
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter a valid address';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },

    askSUDetails: (name, remote) => {

        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for the Storage Unit:',
                default: name,
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter a name for the Storage Unit.';
                    }
                }
            },
            {
                type: 'input',
                name: 'remote',
                message: 'Enter the URL of the remote Git repository:',
                default: remote,
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter a valid URL.';
                    }
                }
            },
            {
                type: 'input',
                name: 'description',
                default: null,
                message: 'Optionally enter a description of the Storage Unit:'
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
                message: process.cwd().replace(/\\/g, "/") + "/" + ' ' + s,
                choices: ['Yes', 'No'],
                default: 'Yes'
            }
        ];
        return inquirer.prompt(questions);
    },

};
