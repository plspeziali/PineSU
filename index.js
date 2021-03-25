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
  } else if (inqstart.startans === "Create new SU / Register SU to your account") {

    await create();
    run();

  } else if (inqstart.startans === "Register SU in the blockchain network") {

    await register();
    run();

  } else if (inqstart.startans === "Check SU integrity") {

    await check();
    run();

  } else if (inqstart.startans === "Export files from current SU"){
    // TODO
    await distribute();
    run();

  } else if (inqstart.startans === "Check files integrity"){
    // TODO
    await checkFiles();
    run();

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

  var filelist = await gitLogic.commitSU("").then( async () => {
    spinnerAdd.succeed("All files added");
    return await gitLogic.calculateSU()
  });
  
  if(filelist[0] == "null"){
    gitLogic.resetCommit();
    return;
  }

  var merkleroot = gitLogic.calculateTree(filelist);

  await inquirer.askSUDetails(files.getCurrentDirectoryBase()).then((details) => {
    Object.assign(details, {owner: ownID});
    Object.assign(details, {hash: merkleroot.toString('utf8')});
    Object.assign(details, {filelist: filelist})
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

const check = async () => {
  
};

const checkFiles = async () => {
  
  var pifiles = files.readPifiles();
  if(pifiles[0] == "null"){
    console.log(chalk.red('No ".pifiles.json" found in the current folder'));
    run();
  }
  for(var el in pifiles){
    
  }

};

const distribute = async () => {

  var filelist = await files.distributeSU();

  if(filelist[0] != "null"){
    var filesJSON = gitLogic.createFilesJSON(filelist);
    files.createZIP(filelist, filesJSON);
    console.log(chalk.green("ZIP file successfully created at "+process.cwd().replace(/\\/g, "/")+"/pinesuExport.zip"))
  } else {
    console.log(chalk.red("An error occurred. Please create a SU in this directory and/or select a file to distribute."))
  }

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
