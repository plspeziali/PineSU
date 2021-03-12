#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');
const files = require('./lib/files');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PineSU', { horizontalLayout: 'full' })
  )
);

const run = async () => {

  const inqstart = await inquirer.startAction();

  if(inqstart.startans === "Exit"){
    console.log(chalk.green("Goodbye!"));
    process.exit(0);
  } else if (inqstart.startans === "Download SU"){
    // TODO
  } else if (inqstart.startans === "Export SU"){
    // TODO
  } else if (inqstart.startans === "Get / Change identity"){
    var res = files.readID();
    if(res.id === "null"){
      const inquser = await inquirer.chooseUsername();
      files.writeID(inquser.username);
      var res = files.readID();
    }
    console.log("Your username is "+res.username+" and your ID is "+res.id);
    
    const inqchuser = await inquirer.changeUsername();

    if(inqchuser.userchange == "Yes"){
      const inquser = await inquirer.chooseUsername();
      files.writeID(inquser.username);
      files.readID();
    }

    run();

  } else if (inqstart.startans === "Create new SU") {

    if (files.directoryExists('.git')) {
      console.log(chalk.green('Already a Git repository!'));
    } else {
      const setup = await inquirer.gitSetup();
      if(setup.gitinit == "Yes"){
        gitLogic.init();
      }else{
        console.log('PineSU requires the folder to be initialized as a git repository in order to\nwork');
        process.exit();
      }
    }
  
    /*if(!(await gitLogic.hasRemote())){
      await gitLogic.addRemoteSU("http://localhost:7005/prova");
    }*/
  
    const inqignore = await inquirer.gitAdd();
    if(inqignore.gitignore == "Yes"){
      await files.createGitignore();
    }
  
    gitLogic.addFileSU('.gitignore');
    gitLogic.addAllSU();
    files.createPineSUDir();
  
    gitLogic.commitSU("").then(() => {gitLogic.calculateSU()});
    const details = await inquirer.askSUDetails(files.getCurrentDirectoryBase());
    await files.saveJSON(details,"suinfo");
    console.log(chalk.green("The Storage Unit has been created!"));
  
    gitLogic.resetCommit();
    gitLogic.addAllSU();
  
    const commit = await inquirer.gitCommit();
    if(commit.message != "[Commit # by PineSU]"){
      await gitLogic.commitSU(commit.message);
    } else {
      await gitLogic.commitSU("");
    }
    
    //console.log(chalk.yellow("The Storage Unit will now be uploaded to our server..."));
    //await gitLogic.pushSU();

  }

};
  
run();
