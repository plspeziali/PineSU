#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const ora = require('ora');
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');
const ethLogic = require('./logic/ethLogic');
const files = require('./lib/files');
var w1, w2, k, mc, sg;

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PineSU', { horizontalLayout: 'full' })
  ) 
);

const run = async () => {

  /*var res = files.readID();
  if(typeof(res.id) == undefined || res.id === "null"){
    const inquser = await inquirer.chooseAddresses();
    files.writeID(inquser.username, inquirer.hash, []);
    var res = files.readID();
  }
  ownID = res.id;*/
  var res = await files.readWallet();
  w1 = res.wallet1;
  w2 = res.wallet2;
  k = res.pkey;

  ethLogic.connect(w1,w2,k);

  mc = files.loadTree();

  sg = files.loadSG();

  const inqstart = await inquirer.startAction();

  switch(inqstart.startans){
    case "Exit":
      console.log(chalk.green("Goodbye!"));
      process.exit(0);

    case "Create new SU / Recalculate open SU":
      if(!files.isClosed()){
        await create();
      } else {
        console.log(chalk.red("This folder is already a Storage Unit and is closed"))
      }
      run();
      break;
    case "Stage Storage Unit for Synchronization":
      if(files.fileExists(".pinesu.json")){
        await stage();
      } else {
        console.log(chalk.red("This folder is not a Storage Unit"))
      }
      run();
      break;
    case "Close current SU":
      if(files.fileExists(".pinesu.json")){
        await close();
      } else {
        console.log(chalk.red("This Storage Unit is already closed"))
      }
      run();
      break;
    case "Register Staged SUs in the blockchain network":
      await register();
      run();
      break;

    case "Check SU integrity":
      await check();
      run();
      break;

    case "Export files from current SU":
      if(files.fileExists(".registration.json")){
        await distribute();
      } else {
        console.log(chalk.red("This folder is not a Storage Unit"))
      }
      run();
      break; 

    case "Check files integrity":
      await checkFilesBlockchain();
      run();
      break;

    case "Custom Git command":
      await customGit();
      run();
      break;

    case "Get / Change Wallet Addresses":
      await addresses();
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
    var hash = merkleroot.toString('utf8');
    Object.assign(details, {owner: w1});
    Object.assign(details, {hash: hash});
    Object.assign(details, {filelist: filelist});
    Object.assign(details, {closed: false});
    files.saveJSON(details);
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

  //var pinesu = files.readPineSUFile('.pinesu.json');
  //ethLogic.addToTree(pinesu.name, pinesu.pinesuhash);

};


const stage = async () => {
  var pinesu = files.readPineSUFile(".pinesu.json");
  const found = sg.some(el => el.hash == pinesu.hash);
  if(!found){
    sg.push({
      name: pinesu.name,
      hash: pinesu.hash,
      path: files.getCurrentDirectoryABS(),
      closed: pinesu.closed
    });
    files.saveSG(sg);
  }
};


const close = async () => {
  var pinesu = files.closePineSUFile('.pinesu.json');
  if(pinesu == null){
    console.log(chalk.red("This folder is not a Storage Unit"));
  } else {
    console.log(chalk.green("The Storage Unit has been closed!"));
  }
};


const register = async () => {

  [document, openRoot, closedRoot] = files.createSGTrees(sg);

  if(openRoot != null){
    ethLogic.addToTree(openRoot, mc, false);
  }
  if(closedRoot != null){
    ethLogic.addToTree(closedRoot, mc, true);
  }
  if(openRoot != null || closedRoot != null){
    console.log([openRoot, closedRoot])
    var [oHash, cHash, transactionHash] = await ethLogic.registerMC(mc);
    console.log(transactionHash);

    for(var el of document){
      el.oHash = oHash;
      el.cHash = cHash;
      el.transactionHash = transactionHash;
      files.createRegistration(el);
      await gitLogic.makeRegistrationCommit(el.path);
    }

    gitLogic.changeDir('.');

    files.flushSG();

    files.saveTree(mc);
  } else {
    console.log(chalk.red("There are no Storage Units staged!"));
  }
};


const check = async () => {

  const spinnerCalc = ora('Calculating the Storage Unit hash...').start();
  await gitLogic.calculateSU().then( async (filelist) => {
    //console.log("\n"+filelist+"\n")
    var merkleroot = gitLogic.calculateTree(filelist);
    var pinesu = files.readPineSUFile(".pinesu.json");
    spinnerCalc.succeed("Calculation complete!");
    console.log(pinesu.hash+"\n"+merkleroot);
    checkFiles();
    if(pinesu.hash == merkleroot){
      var res = files.checkRegistration(merkleroot)
      console.log(res);
      if(res[0]){
        console.log(chalk.green("The integrity of the local files has been verified and\nit matches the original hash root.\nProceeding with the blockchain check"));
        if(await ethLogic.verifyHash(mc, res[1].root, res[1].oHash, res[1].cHash, res[1].transactionHash)){
          console.log(chalk.green("The Storage Unit has been found in the blockchain"));
        } else {
          console.log(chalk.red("The Storage Unit hasn't been found in the blockchain"));
        }
      } else {
        console.log(chalk.red("The integrity of the files can't be been verified since they don't\nmatch the latest registration"));
      }
    } else {
      console.log(chalk.red("The integrity of the files can't be been verified since they don't\nmatch the original hash root"));
    }
  });

};


const checkFiles = async () => {
  
  var pifiles = files.readPifiles();
  if(pifiles[0] == "null"){
    console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
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

const checkFilesBlockchain = async () => {
  
  var pifiles = files.readPifiles();
  if(pifiles[0] == "null"){
    console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
    return;
  }

  for(var el of pifiles){
    var hash = gitLogic.fileHashSync(el.path)
    if(gitLogic.validateProof(el.proof, hash, el.root)){
      console.log(chalk.green("The integrity of the file "+el.path+"\nhas been verified and it matches the original hash root"));
      var res = files.checkRegistration(merkleroot)
      //console.log(res);
      if(res[0]){
        console.log(chalk.green("The integrity of "+el.path+" has been verified and\nit matches the original hash root.\nProceeding with the blockchain check"));
        if(await ethLogic.verifyHash(mc, res[1].root, res[1].oHash, res[1].cHash, res[1].transactionHash)){
          console.log(chalk.green("The Storage Unit of the file "+el.path+"\nhas been found in the blockchain"));
        } else {
          console.log(chalk.red("The Storage Unit of the file "+el.path+"\nhasn't been found in the blockchain"));
        }
      } else {
        console.log(chalk.red("The integrity of the file can't be been verified since they don't\nmatch the latest registration"));
      }
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

const addresses = async () => {

    console.log("Your first wallet's address is "+chalk.black.bgGreen(w1));
    console.log("Your second wallet's address is "+chalk.black.bgGreen(w2));
    console.log("Your first wallet's private key is "+chalk.black.bgRed(k));

    const inqchuser = await inquirer.changeAddresses();

    if(inqchuser.addresschange == "Yes"){
      var res = await files.readWallet();
      w1 = res.wallet1;
      w2 = res.wallet2;
      k = res.pkey;
    }

};

run();
