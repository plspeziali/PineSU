#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const ora = require('ora');
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');
const files = require('./lib/files');
var ownID;

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PineSU', { horizontalLayout: 'full' })
  )
);

const run = async () => {

  var res = files.readID();
  if(typeof(res.id) == undefined || res.id === "null"){
    const inquser = await inquirer.chooseUsername();
    files.writeID(inquser.username, inquirer.hash, []);
    var res = files.readID();
  }
  ownID = res.id;

  const inqstart = await inquirer.startAction();

  if(inqstart.startans === "Exit"){
    console.log(chalk.green("Goodbye!"));
    process.exit(0);
  } else if (inqstart.startans === "Create new SU") {

    await create();
    run();

  } else if (inqstart.startans === "Register SU") {

    await register();
    run();

  } else if (inqstart.startans === "Download SU"){
    // TODO
    await download();
    run();

  } else if (inqstart.startans === "Export SU"){
    // TODO
    await distribute();

  } else if (inqstart.startans === "Get / Change identity"){
    
    await identity();
    run();

  }

};

const create = async () => {

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

  const inqignore = await inquirer.gitAdd();
  if(inqignore.gitignore == "Yes"){
    await files.createGitignore();
    await gitLogic.addFileSU('.gitignore');
  }
  const spinnerAdd = ora('Adding files to the SU...').start();
  await gitLogic.addAllSU();
  files.createPineSUDir();

  var tree = await gitLogic.commitSU("").then( async () => {return await gitLogic.calculateSU()});

  spinnerAdd.succeed("All files added");
  await inquirer.askSUDetails(files.getCurrentDirectoryBase()).then((details) => {
    Object.assign(details, {owner: ownID});
    Object.assign(details, {hash: Object.keys(tree)[0].split(':')[1]});
    files.addToUser(details.owner,details.name,details.hash);
    files.saveJSON(details,"suinfo");
    console.log(chalk.green("The Storage Unit has been created!"));
  });
  
  gitLogic.resetCommit();
  await gitLogic.addAllSU();

  const commit = await inquirer.gitCommit();
  if(commit.message != "[Commit # by PineSU]"){
    await gitLogic.commitSU(commit.message);
  } else {
    await gitLogic.commitSU("");
  }

};

const register = async () => {

  var sulist = files.readSUList();
  if(sulist[0] !== "null"){
    const inqreg = await inquirer.askRegSU(sulist);
    
  } else {
    console.log(chalk.red("You have not created any Storage Unit yet!"))
  }

};

const download = async () => {
  
};

const distribute = async () => {
  
};

const identity = async () => {

  var res = files.readID();
    if(res.id === "null"){
      const inquser = await inquirer.chooseUsername();
      files.writeID(inquser.username, inquirer.hash, "null");
      var res = files.readID();
      ownID = res.id;
    }
    console.log("Your username is "+chalk.black.bgGreen(res.username)+" and your ID is "+chalk.black.bgYellow(res.id));
    
    const inqchuser = await inquirer.changeUsername();

    if(inqchuser.userchange == "Yes"){
      const inquser = await inquirer.chooseUsername();
      files.writeID(inquser.username, inquser.hash, ["no-change"]);
      files.readID();
      ownID = res.id;
    }

};

run();
