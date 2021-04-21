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

  switch(inqstart.startans){
    case "Exit":
      console.log(chalk.green("Goodbye!"));
      process.exit(0);

    case "Create new SU":
      if(!files.fileExists(".pinesu.json")){
        await create();
      } else {
        console.log(chalk.red("This folder is already a Storage Unit"))
      }
      run();
      break;

    case "Register SU in the blockchain network":
      await register();
      run();
      break;

    case "Check SU integrity":
      if(files.fileExists(".registration.json")){
        await check();
      } else {
        console.log(chalk.red("This Storage Unit is not registered in the blockchain network"))
      }
      run();
      break;

    case "Export files from current SU":
      if(files.fileExists(".pinesu.json")){
        await distribute();
      } else {
        console.log(chalk.red("This folder is not a Storage Unit"))
      }
      run();
      break; 

    case "Check files integrity":
      await checkFiles();
      run();
      break;

    case "Custom Git command":
      await customGit();
      run();
      break;

    case "Custom Git command":
      await identity();
      run();
      break;
  }

};

const create = async () => {

  if (files.fileExists('.git')) {
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
  const spinnerAdd = ora('Adding files to the Storage Unit...').start();
  await gitLogic.addAllSU();

  var filelist = await gitLogic.commitSU("").then( async () => {
    return await gitLogic.calculateSU()
  });
  
  if(filelist[0] == "null"){
    gitLogic.resetCommit();
    return;
  }

  var merkleroot = gitLogic.calculateTree(filelist);
  spinnerAdd.succeed("All files added");

  await inquirer.askSUDetails(files.getCurrentDirectoryBase()).then((details) => {
    Object.assign(details, {owner: ownID});
    Object.assign(details, {hash: merkleroot.toString('utf8')});
    Object.assign(details, {filelist: filelist})
    files.saveJSON(details);
    files.addToUser(details.owner,details.name,details);
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
    files.writeHashes(inqreg.register);
  } else {
    console.log(chalk.red("You have not created any Storage Unit yet!"))
  }

};

const check = async () => {

  const spinnerCalc = ora('Calculating the Storage Unit hash...').start();
  await gitLogic.calculateSU().then( async (filelist) => {
    //console.log("\n"+filelist+"\n")
    var merkleroot = gitLogic.calculateTree(filelist);
    var pinesu = files.readPineSUFile(".pinesu.json");
    spinnerCalc.succeed("Calculation complete!");
    //console.log(pinesu.hash+"\n"+merkleroot);
    if(pinesu.hash == merkleroot){
      if(files.checkRegistration(pinesu.pinesuhash)){
        await checkFiles();
        console.log(chalk.green("The integrity of the local files has been verified and\nit matches the original hash root.\nProceeding with the blockchain check"));
        files.blockchainCheck();
      } else {
        console.log(chalk.red("The integrity of the files \ncan't be been verified since they don't match the original hash root"));
      }
    } else {
      console.log(chalk.red("The integrity of the files can't be been verified\nsince they don't match the original hash root"));
    }
  });

};

const checkFiles = async () => {
  
  var pifiles = files.readPifiles();
  if(pifiles[0] == "null"){
    console.log(chalk.red('No ".pifiles.json" found in the current folder'));
    return;
  }

  for(var el of pifiles){
    var hash = gitLogic.fileHashSync(el.path)
    if(gitLogic.validateProof(el.proof, hash, el.root)){
      console.log(chalk.green("The integrity of the file "+el.path+"\nhas been verified and it matches the original hash root"));
    } else {
      console.log(chalk.red("The integrity of the file "+el.path+"\ncan't be been verified since it doesn't match the original hash root"));
    }
  }

};

const distribute = async () => {

  var filelist = await files.distributeSU();

  if(filelist[0] != "null"){
    var filesJSON = gitLogic.createFilesJSON(filelist);
    files.createZIP(filelist, filesJSON);
    console.log(chalk.green("ZIP file successfully created at "+process.cwd().replace(/\\/g, "/")+"/../pinesuExport.zip"))
  } else {
    console.log(chalk.red("An error occurred. Please create a SU in this directory\nand/or select a file to distribute."))
  }

};

const customGit = async () => {

  try {
  await inquirer.gitCustom().then( async (res) => {
    console.log(await gitLogic.customGit(res.command));
  });
  } catch(e){
    console.log(chalk.red("Error! You may have entered an invalid Git command!"));
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
