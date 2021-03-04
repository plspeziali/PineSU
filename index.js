#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PineSU', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a Git repository!'));
  } else {
    const setup = await inquirer.gitSetup();
    if(setup.gitinit == "Yes"){
      gitLogic.init();
    }else{
      console.log('PineSU requires the folder to be initialized as a git repository in order to work');
      process.exit();
    }
  }

  const ignore = await inquirer.gitAdd();
  if(ignore.gitignore == "Yes"){
    files.createGitignore();
  }

  gitLogic.addFileSU('.gitignore');
  gitLogic.addAllSU();

  const commit = await inquirer.gitCommit();
  if(commit.message != "[Commit # by PineSU]"){
    gitLogic.commitSU(commit.message);
  } else {
    gitLogic.commitSU("");
  }

  gitLogic.calculateSU;
  
  const details = await inquirer.askSUDetails();

  files.saveJSON(details,"suinfo");
  process.exit();
};
  
run();
