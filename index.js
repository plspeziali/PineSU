#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const ora = require('ora');
const { v4: uuidv4 } = require("uuid");
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');
const ethLogic = require('./logic/ethLogic');
const files = require('./lib/files');
let w1, w2, k, mc, sg;

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PineSU', { horizontalLayout: 'full' })
  ) 
);


const init = async () => {
  var res = await files.readWallet();
  w1 = res.wallet1;
  w2 = res.wallet2;
  k = res.pkey;

  ethLogic.connect(w1,w2,k);

  mc = files.loadTree();

  sg = files.loadSG();

  run();
}


const run = async () => {

  const inqstart = await inquirer.startAction();

  switch(inqstart.startans){
    case 'exit':
      console.log(chalk.green("Goodbye!"));
      process.exit(0);

    case 'create / update':
      if(!files.isClosed()){
        await create();
      } else {
        console.log(chalk.red("This folder is already a Storage Unit and is closed"))
      }
      run();
      break;
    case 'stage':
      if(files.fileExists(".pinesu.json")){
        await stage();
      } else {
        console.log(chalk.red("This folder is not a Storage Unit"))
      }
      run();
      break;
    case 'close':
      if(files.fileExists(".pinesu.json")){
        await close();
      } else {
        console.log(chalk.red("This folder is not a Storage Unit"))
      }
      run();
      break;
    case 'sync':
      await register();
      run();
      break;

    case 'checkbc':
      await check();
      run();
      break;

    case 'export':
      if(files.fileExists(".registration.json")){
        await distribute();
      } else {
        console.log(chalk.red("This Storage Unit hasn't been registered yet"))
      }
      run();
      break; 

    case 'checkfile':
      await checkFilesBlockchain();
      run();
      break;

    case 'git':
      await customGit();
      run();
      break;

    case 'settings':
      await addresses();
      run();
      break;

    case 'help':
      await help();
      run();
      break;
  }

};


const create = async () => {

  // Controllo d'esistenza di repository Git con creazione in caso contrario
  if (files.fileExists('.git')) {
    console.log(chalk.green('Already a Git repository!'));
  } else {
    const setup = await inquirer.gitSetup();
    if(setup.gitinit === "Yes"){
      gitLogic.init();
    }else{
      console.log('PineSU requires the folder to be initialized as a git repository in order to\nwork');
      process.exit();
    }
  }

  // Creazione del .gitignore 
  const inqignore = await inquirer.gitAdd();
  if(inqignore.gitignore === "Yes"){
    await files.createGitignore();
    await gitLogic.addFileSU('.gitignore');
  }

  // Aggiunta dei file della directory a un commit "fantoccio"
  // e calcolo dei loro hash
  const spinnerAdd = ora('Adding files to the Storage Unit...').start();
  await gitLogic.addAllSU();

  var filelist = await gitLogic.commitSU("").then( async () => {
    return await gitLogic.calculateSU()
  });
  
  if(filelist[0] == "null"){
    gitLogic.resetCommit();
    return;
  }

  // Calcolo del Merkle Tree della SU
  var merkleroot = gitLogic.calculateTree(filelist);
  spinnerAdd.succeed("All files added");

  let remote = await gitLogic.getRemote();

  if(typeof(remote) == "undefined" || remote.length == 0){
    remote = "localhost";
  }

  // Reperimento di un vecchio uuid
  var content = files.readPineSUFile()
  if(content[0] != 'null'){
    var uuidSU = content.uuid;
  } else {
    var uuidSU = uuidv4();
  }

  // Creazione del file .pinesu.json contenente i metadati della SU
  await inquirer.askSUDetails(files.getCurrentDirectoryBase(), remote).then((details) => {
    var hash = merkleroot.toString('utf8');
    Object.assign(details, {uuid: uuidSU});
    Object.assign(details, {owner: w1});
    Object.assign(details, {hash: hash});
    Object.assign(details, {filelist: filelist});
    Object.assign(details, {closed: false});
    files.saveJSON(details);
    try{
      gitLogic.setRemote(details.remote);
    } catch(e){
      // TODO
    }
    console.log(chalk.green("The Storage Unit has been created!"));
  });
  
  // Reset del commit "fantoccio" e creazione
  // di un commit vero e proprio includendo
  // anche il file descrittore JSON
  gitLogic.resetCommit();
  await gitLogic.addAllSU();

  const commit = await inquirer.gitCommit();
  if(commit.message != "[Commit # by PineSU]"){
    await gitLogic.commitSU(commit.message);
  } else {
    await gitLogic.commitSU("");
  }
  
  try{
    await gitLogic.pushSU();
  } catch(e){
    // TODO
  }

};


const stage = async () => {

  // Lettura dei metadati della SU,
  // se non è già presente viene
  // inserita nello SG
  var pinesu = files.readPineSUFile();
  const found = sg.some(el => el.hash == pinesu.hash);
  if(!found){
    sg.push({
      name: pinesu.name,
      hash: pinesu.hash,
      path: files.getCurrentDirectoryABS(),
      closed: pinesu.closed
    });
    // Sorting in ordine lessicografico di uuid dello Storage Group
    sg.sort((a,b)=> (a.uuid > b.uuid ? 1 : -1))
    files.saveSG(sg);
  }
};


const close = async () => {

  // Chiusura "weak", vengono controllati i commit,
  // se è presente un commit di chiusura viene
  // annullata l'operazione, altrimenti si chiude la SU
  let res1 = await gitLogic.checkCommitMessages();
  let res2 = await gitLogic.checkCommitMessages();
  if(res1 && res2){
    const pinesu = files.closePineSUFile();
    if(pinesu == null){
      console.log(chalk.red("This folder is not a Storage Unit"));
    } else {
      console.log(chalk.green("The Storage Unit has been closed!"));
      await gitLogic.addFileSU(".pinesu.json");
      await gitLogic.commitSU("The Storage Unit is now closed");
      await stage();
    }
  } else {
    console.log(chalk.red("This Storage Unit has already been closed in the past"));
  }
};


const register = async () => {

  // Vengono calcolate le MR dei due Storage Group
  [document, openRoot, closedRoot] = files.createSGTrees(sg);
  const date = new Date();
  // Si aggiungono massimo due nuovi BSP al Merkle Calendar
  if(openRoot != null){
    var proofBSPO = ethLogic.addToTree(openRoot, mc, false, date);
  }
  if(closedRoot != null){
    var proofBSPC = ethLogic.addToTree(closedRoot, mc, true, date);
  }
  if(openRoot != null || closedRoot != null){
    // Si richiama il connettore per la rete Ethereum
    // per registrare la root del Merkle Calendar nella blockchain
    var [oHash, cHash, transactionHash] = await ethLogic.registerMC(mc);

    // Si creano i file di metadati ".registration.json"
    // da inserire in ogni directory delle SU facente parti
    // degli Storage Group appena inseriti
    for(var el of document){
      el.oHash = oHash;
      el.cHash = cHash;
      el.transactionHash = transactionHash;
      el.date = date;
      el.proofBSPO = proofBSPO;
      el.proofBSPC = proofBSPC;
      files.createRegistration(el);
      // Si fa un Git Commit in ognuna di queste SU
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

  // Si calcolano gli hash della SU in esame
  const spinnerCalc = ora('Calculating the Storage Unit hash...').start();
  await gitLogic.calculateSU().then( async (filelist) => {
    // Si leggono i suoi metadati e si calcola
    // la MR della SU attuale
    var merkleroot = gitLogic.calculateTree(filelist);
    var pinesu = files.readPineSUFile();
    spinnerCalc.succeed("Calculation complete!");
    // Si controlla l'integrità di file descritti
    // da un eventuale ".pifiles.json"
    checkFiles();
    // Si controlla che la MR appena calcolata corrisponda
    // con quella precedentemente registrata
    if(pinesu.hash == merkleroot){
      // Si verifica che lo stato della SU combaci
      // con l'ultimo stato registrato in blockchain
      // (da quanto dicono i metadati)
      var res = files.checkRegistration(merkleroot)
      if(res[0]){
        console.log(chalk.green("The integrity of the local files has been verified and\nit "+
                                "matches the original hash root.\nProceeding with the blockchain check"));
        // Si procede all'effettivo controllo su blockchain
        let realHash = gitLogic.calculateRealHash(new Date(res[1].date), res[1].root)
        console.log(await ethLogic.verifyHash(mc, realHash, res[1].oHash, res[1].cHash, res[1].transactionHash, w1))
        if(await ethLogic.verifyHash(mc, realHash, res[1].oHash, res[1].cHash, res[1].transactionHash, w1)){
          console.log(chalk.green("The Storage Unit has been found in the blockchain"));
        } else if(await ethLogic.validateProof(mc, res[1].root, res[1].openProofTree, res[1].closedProofTree, res[1].transactionHash, w1)) {
          console.log(chalk.green("The Storage Unit has been found in the blockchain through the backed up Merkle Calendar"));
        } else {
          console.log(chalk.red("The Storage Unit hasn't been found in the blockchain"));
        }
      } else {
        console.log(chalk.red("The integrity of the files can't be been verified since they "+
                              +"don't\nmatch the latest registration"));
      }
    } else {
      console.log(chalk.red("The integrity of the files can't be been verified since they "+
                            +"don't\nmatch the original hash root"));
    }
  });

};


const checkFiles = async () => {
  
  // Si controlla la presenza nella directory di un file chiamato ".pifiles.json"
  var pifile = files.readPifile();
  if(pifile[0] == "null"){
    console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
    return;
  }

  // Per ogni file elencato in ".pifiles.json" si effettuano controlli locali
  for(var el of pifile){
    var hash = gitLogic.fileHashSync(el.path)
    if(gitLogic.validateProof(el.proof, hash, el.root)){
      console.log(chalk.green("The integrity of the file "+el.path+"\nhas been verified and it matches the original hash root"));
    } else {
      console.log(chalk.red("The integrity of the file "+el.path+"\ncan't be been verified since it doesn't match the original hash root"));
    }
  }

};


const checkFilesBlockchain = async () => {
  
  // Si controlla la presenza nella directory di un file chiamato ".pifiles.json"
  var pifile = files.readPifile();
  if(pifile[0] == "null"){
    console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
    return;
  }

  // Per ogni file elencato in ".pifiles.json" si effettuano controlli locali
  for(var el of pifile){
    var hash = gitLogic.fileHashSync(el.path)
    if(gitLogic.validateProof(el.proof, hash, el.root)){
      console.log(chalk.green("The integrity of the file "+el.path+"\nhas been verified and it matches the original hash root"));
      var res = files.checkRegistration(el.root)
      if(res[0]){
        // Se la verifica locale è andata a buon fine si esegue una verifica su blockchain
        console.log(chalk.green("The file "+el.path+" was verified\nin being once part of a Storage Unit.\nProceeding with the blockchain check"));
        if(await ethLogic.verifyHash(mc, res[1].root, res[1].oHash, res[1].cHash, res[1].transactionHash, w1)){
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

  // Si fanno scegliere all'utente i file da inserire nell'archivio
  var filelist = await files.distributeSU();

  if(filelist[0] != "null"){
    // Si crea il file ZIP con i file e un descrittore ".pifiles.json"
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

    console.log("Your first wallet's address is");
    console.log("Your second wallet's address is "+chalk.black.bgGreen(w2));
    console.log("Your first wallet's private key is "+chalk.black.bgRed(k));

    const inqchuser = await inquirer.changeAddresses();

    if(inqchuser.addressChange === "Yes"){
      var res = await files.readWallet();
      w1 = res.wallet1;
      w2 = res.wallet2;
      k = res.pkey;
      r = res.remote;
    }

};


const help = async () => {

  console.log(chalk.green("create / update")+": Create a new SU or update the hashes of an existing one");
  console.log(chalk.green("stage")+": Flag a SU for the collective blockchain synchronizing");
  console.log(chalk.green("close")+": Close a SU and flag it for the collective blockchain synchronizing");
  console.log(chalk.green("sync")+": Synchronize the staged or closed SUs");
  console.log(chalk.green("checkbc")+": Verify the integrity of a SU on the blockchain");
  console.log(chalk.green("checkfile")+": Verify the integrity of a file / batch of files");
  console.log(chalk.green("export")+": Export a a blockchain verifiable bundle");
  console.log(chalk.green("git")+": Perform a custom Git command");
  console.log(chalk.green("settings")+": Check the registered user information and change it");

};

init();
