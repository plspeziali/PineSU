#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const ora = require('ora');
const {v4: uuidv4} = require("uuid");
const inquirer = require('./lib/inquirer');
const gitLogic = require('./logic/gitLogic');
const ethLogic = require('./logic/ethLogic');
const files = require('./lib/files');
let w1, w2, k, mc, sg;

clear();

console.log(
    chalk.yellow(
        figlet.textSync('PineSU', {horizontalLayout: 'full'})
    )
);


const init = async () => {
    const res = await files.readWallet(false);
    w1 = res.wallet1;
    w2 = res.wallet2;
    k = res.pkey;

    const ethHost = await inquirer.ethHost();

    ethLogic.connect(w1, w2, k, ethHost.host);

    mc = files.loadTree();

    sg = files.loadSG();

    await run();
}


const run = async () => {

    const inqstart = await inquirer.startAction();

    switch (inqstart.startans) {
        case 'exit':
            console.log(chalk.green("Goodbye!"));
            process.exit(0);

        case 'create / update':
            if (!files.isClosed()) {
                await create();
            } else {
                console.log(chalk.red("This folder is already a Storage Unit and is closed"))
            }
            await run();
            break;
        case 'stage':
            if (files.fileExists(".pinesu.json")) {
                await stage();
            } else {
                console.log(chalk.red("This folder is not a Storage Unit"))
            }
            await run();
            break;
        case 'close':
            if (files.fileExists(".pinesu.json")) {
                await close();
            } else {
                console.log(chalk.red("This folder is not a Storage Unit"))
            }
            await run();
            break;
        case 'syncwbc':
            if(sg.length !== 0){
                await register();
            }
            await run();
            break;

        case 'checkbc':
            await check();
            await run();
            break;

        case 'export':
            if (files.fileExists(".registration.json")) {
                //await distribute();
                console.log(chalk.yellow("Functionality under construction"))
            } else {
                console.log(chalk.red("This Storage Unit hasn't been registered yet"))
            }
            await run();
            break;

        case 'checkfile':
            //await checkFilesBlockchain();
            console.log(chalk.yellow("Functionality under construction"))
            await run();
            break;

        case 'git':
            await customGit();
            await run();
            break;

        case 'settings':
            await addresses();
            await run();
            break;

        case 'help':
            await help();
            await run();
            break;
    }

};


const create = async () => {

    // Controllo d'esistenza di repository Git con creazione in caso contrario
    if (files.fileExists('.git')) {
        console.log(chalk.green('Already a Git repository!'));
    } else {
        const setup = await inquirer.gitSetup();
        if (setup.gitinit === "Yes") {
            gitLogic.init();
        } else {
            console.log('PineSU requires the folder to be initialized as a git repository in order to\nwork');
            process.exit();
        }
    }

    // Creazione del .gitignore
    const inqignore = await inquirer.gitAdd();
    if (inqignore.gitignore === "Yes") {
        await files.createGitignore();
        await gitLogic.addFileSU('.gitignore');
    }

    // Aggiunta dei file della directory a un commit "fantoccio"
    // e calcolo dei loro hash
    const spinnerAdd = ora('Adding files to the Storage Unit...').start();

    const filelist = await gitLogic.calculateSU();
    console.log(filelist);

    if (filelist[0] === "null") {
        spinnerAdd.fail("No files could be added");
        return;
    }

    // Calcolo del Merkle Tree della SU
    const merkleroot = gitLogic.calculateTree(filelist);
    spinnerAdd.succeed("All files added");

    let remote = await gitLogic.getRemote();

    if (typeof (remote) == "undefined" || remote.length === 0) {
        remote = "localhost";
    }

    // Reperimento di un vecchio uuid
    // se non esiste, ne generiamo uno nuovo
    const oldContent = files.readPineSUFile();
    let uuidSU;
    if (!oldContent) {
        uuidSU = oldContent.uuid;
    } else {
        uuidSU = uuidv4();
    }

    // Reperimento del time attuale
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);


    // Creazione del file .pinesu.json contenente i metadati della SU
    // Aggiungere timestamp ISO timestamp 8061 con i secondi pure
    await inquirer.askSUDetails(files.getCurrentDirectoryBase(), remote).then((details) => {
        const pineSUFile = {};
        pineSUFile.hash = null;
        pineSUFile.header = {};

        pineSUFile.header.uuid = uuidSU;
        pineSUFile.header.remote = details.remote;
        pineSUFile.header.owner = w1;
        pineSUFile.header.name = details.name;
        pineSUFile.header.description = details.description;
        pineSUFile.header.crtime = today.toISOString();
        pineSUFile.header.prevmkcalroot = oldContent.prevmkcalroot;
        pineSUFile.header.prevsuhash = oldContent.prevsuhash;
        pineSUFile.header.prevbcregnumber = oldContent.prevbcregnumber;
        pineSUFile.header.prevbcregtime = oldContent.prevbcregtime;
        pineSUFile.header.prevclosed = oldContent.prevclosed;
        pineSUFile.header.merkleroot = merkleroot.toString('utf8');

        pineSUFile.hash = gitLogic.calculateHeader(pineSUFile.header);

        pineSUFile.filelist = filelist;
        pineSUFile.offhash = {};

        pineSUFile.offhash.bcregnumber = oldContent.bcregnumber;
        pineSUFile.offhash.bcregtime = oldContent.bcregtime;
        pineSUFile.offhash.closed = false;

        files.savePineSUJSON(pineSUFile);
        try {
            gitLogic.setRemote(details.remote);
        } catch (e) {
            // TODO
        }
        console.log(chalk.green("The Storage Unit has been created!"));
    });

    // commit includendo
    // anche il file descrittore JSON
    await gitLogic.addAllSU();

    const commit = await inquirer.gitCommit();
    if (commit.message !== "[Commit # by PineSU]") {
        await gitLogic.commitSU(commit.message);
    } else {
        await gitLogic.commitSU("");
    }

    try {
        await gitLogic.pushSU();
    } catch (e) {
        // TODO
    }

};


const stage = async () => {

    // Lettura dei metadati della SU,
    // se non è già presente viene
    // inserita nello SG
    const pinesu = files.readPineSUFile();
    const found = sg.some(el => el.hash === pinesu.hash);
    if(found){
        sg = sg.filter(function( obj ) {
            return obj.hash !== pinesu.hash;
        });
    }
    sg.push({
        uuid: pinesu.uuid,
        hash: pinesu.hash,
        path: files.getCurrentDirectoryABS(),
        closed: pinesu.closed
    });
    // Sorting in ordine lessicografico di uuid dello Storage Group
    sg.sort((a, b) => (a.uuid > b.uuid ? 1 : -1))
    files.saveSG(sg);
};


const close = async () => {

    // Chiusura "weak", vengono controllati i commit,
    // se è presente un commit di chiusura viene
    // annullata l'operazione, altrimenti si chiude la SU
    let res1 = true //await gitLogic.checkCommitMessages();
    let res2 = true; // Chiusura forte TODO
    if (res1 && res2) {
        const pinesu = files.closePineSUFile();
        if (pinesu == null) {
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
    [openRoot, closedRoot, openL, closedL] = files.createSGTrees(sg);
    // Reperimento del time attuale
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    // Si aggiungono massimo due nuovi BSP al Merkle Calendar
    let openSG, openWitness, closedSG, closedWitness;
    if (openRoot != null) {
        [openWitness, openSG] = ethLogic.addToTree(openRoot, mc, false, today, openL);
    }
    if (closedRoot != null) {
        [closedWitness, closedSG] = ethLogic.addToTree(closedRoot, mc, true, today, closedL);
    }
    const date = today.toISOString();
    let mkcHash, receipt, bktimestamp;
    if (openRoot != null || closedRoot != null) {
        // Si richiama il connettore per la rete Ethereum
        // per registrare la root del Merkle Calendar nella blockchain
        [mkcHash, receipt, bktimestamp] = await ethLogic.registerMC(mc);
    } else {
        console.log(chalk.red("There are no Storage Units staged!"));
        return;
    }
    if (openRoot != null) {
        // Si creano i file di metadati ".registration.json"
        // da inserire in ogni directory delle SU facente parti
        // degli Storage Group appena inseriti
        for (let el of openL) {
            let o = {
                path: el.path,
                type: "synchronization",
                mkcalroot: mkcHash,
                mkcaltimestamp: date,
                txhash: receipt.transactionHash,
                bkhash: receipt.blockHash,
                bkheight: receipt.blockNumber,
                bktimestamp: bktimestamp,
                witness: openWitness,
                openstoragegroup: openSG
            }
            files.createRegistration(o);
            // Si fa un Git Commit in ognuna di queste SU
            await gitLogic.makeRegistrationCommit(el.path);
        }

        gitLogic.changeDir('.');

        files.flushSG();

        files.saveTree(mc);
    }
    if (closedRoot != null) {
        // Si creano i file di metadati ".registration.json"
        // da inserire in ogni directory delle SU facente parti
        // degli Storage Group appena inseriti
        for (let el of closedL) {
            let o = {
                path: el.path,
                type: "synchronization",
                mkcalroot: mkcHash,
                mkcaltimestamp: date,
                txhash: receipt.transactionHash,
                bkhash: receipt.blockHash,
                bkheight: receipt.blockNumber,
                bktimestamp: bktimestamp,
                witness: closedWitness,
                closedstoragegroup: closedSG
            }
            files.createRegistration(o);
            // Si fa un Git Commit in ognuna di queste SU
            await gitLogic.makeRegistrationCommit(el.path);
        }

        gitLogic.changeDir('.');

        files.flushSG();

        files.saveTree(mc);
    }
};


const check = async () => {

    // Si calcolano gli hash della SU in esame
    const spinnerCalc = ora('Calculating the Storage Unit hash...').start();
    await gitLogic.calculateSU().then(async (filelist) => {
        // Si leggono i suoi metadati e si calcola
        // la MR della SU attuale
        const pinesu = files.readPineSUFile();
        const merkleroot = gitLogic.calculateTree(filelist);
        pinesu.header.merkleroot = merkleroot.toString('utf8');

        for (const key in pinesu.header) {
            if (pinesu.header[key] === '') {
                pinesu.header[key] = null;
            }
        }

        const calculatedHash = gitLogic.calculateHeader(pinesu.header)
        spinnerCalc.succeed("Calculation complete!");
        // Si controlla l'integrità di file descritti
        // da un eventuale ".pifiles.json"
        // await checkFiles();
        // Si controlla che la MR appena calcolata corrisponda
        // con quella precedentemente registrata
        if (pinesu.hash === calculatedHash) {
            // Si verifica che lo stato della SU combaci
            // con l'ultimo stato registrato in blockchain
            // (da quanto dicono i metadati)
            const res = files.checkRegistration(merkleroot);
            console.log(res)
            if (res[0]) {
                console.log(chalk.green("The integrity of the local files has been verified and\nit " +
                    "matches the original hash root.\nProceeding with the blockchain check"));
                // Si procede all'effettivo controllo su blockchain
                let realHash = gitLogic.calculateRealHash(new Date(res[1].date), res[1].root)
                console.log(await ethLogic.verifyHash(mc, realHash, res[1].oHash, res[1].cHash, res[1].transactionHash, w1))
                if (await ethLogic.verifyHash(mc, realHash, res[1].oHash, res[1].cHash, res[1].transactionHash, w1)) {
                    console.log(chalk.green("The Storage Unit has been found in the blockchain"));
                } else if (await ethLogic.validateProof(mc, res[1].root, res[1].openProofTree,res[1].closedProofTree, res[1].transactionHash, w1)) {
                    console.log(chalk.green("The Storage Unit has been found in the blockchain through the backed" +
                        "up Merkle Calendar"));
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

    // Si controlla la presenza nella directory di un file chiamato ".pifiles.json"
    const pifile = files.readPifile();
    if (pifile[0] == "null") {
        console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
        return;
    }

    // Per ogni file elencato in ".pifiles.json" si effettuano controlli locali
    for (let el of pifile) {
        const hash = gitLogic.fileHashSync(el.path);
        if (gitLogic.validateProof(el.proof, hash, el.root)) {
            console.log(chalk.green("The integrity of the file " + el.path + "\nhas been verified and it matches the" +
                "original hash root"));
        } else {
            console.log(chalk.red("The integrity of the file " + el.path + "\ncan't be been verified since it doesn't" +
                "match the original hash root"));
        }
    }

};


const checkFilesBlockchain = async () => {

    // Si controlla la presenza nella directory di un file chiamato ".pifiles.json"
    const pifile = files.readPifile();
    if (pifile[0] == "null") {
        console.log(chalk.cyan('No ".pifiles.json" found in the current folder'));
        return;
    }

    // Per ogni file elencato in ".pifiles.json" si effettuano controlli locali
    for (let el of pifile) {
        const hash = gitLogic.fileHashSync(el.path);
        if (gitLogic.validateProof(el.proof, hash, el.root)) {
            console.log(chalk.green("The integrity of the file " + el.path + "\nhas been verified and it matches" +
                "the original hash root"));
            const res = files.checkRegistration(el.root);
            if (res[0]) {
                // Se la verifica locale è andata a buon fine si esegue una verifica su blockchain
                console.log(chalk.green("The file " + el.path + " was verified\nin being once part of a Storage Unit" +
                    "\nProceeding with the blockchain check"));
                if (await ethLogic.verifyHash(mc, res[1].root, res[1].oHash, res[1].cHash, res[1].transactionHash, w1)) {
                    console.log(chalk.green("The Storage Unit of the file " + el.path +
                        "\nhas been found in the blockchain"));
                } else {
                    console.log(chalk.red("The Storage Unit of the file " + el.path +
                        "\nhasn't been found in the blockchain"));
                }
            } else {
                console.log(chalk.red("The integrity of the file can't be been verified since they don't" +
                    "\nmatch the latest registration"));
            }
        } else {
            console.log(chalk.red("The integrity of the file " + el.path +
                "\ncan't be been verified since it doesn't match the original hash root"));
        }
    }

};


const distribute = async () => {

    // Si fanno scegliere all'utente i file da inserire nell'archivio
    const filelist = await files.distributeSU();

    if (filelist[0] != "null") {
        // Si crea il file ZIP con i file e un descrittore ".pifiles.json"
        const filesJSON = gitLogic.createFilesJSON(filelist);
        files.createZIP(filelist, filesJSON);
        console.log(chalk.green("ZIP file successfully created at " + process.cwd().replace(/\\/g, "/") + "/../pinesuExport.zip"))
    } else {
        console.log(chalk.red("An error occurred. Please create a SU in this directory\nand/or select a file to distribute."))
    }

};


const customGit = async () => {

    try {
        await inquirer.gitCustom().then(async (res) => {
            console.log(await gitLogic.customGit(res.command));
        });
    } catch (e) {
        console.log(chalk.red("Error! You may have entered an invalid Git command!"));
    }

};


const addresses = async () => {

    console.log("Your first wallet's address is " + chalk.black.bgGreen(w1));
    console.log("Your second wallet's address is " + chalk.black.bgGreen(w2));
    console.log("Your first wallet's private key is " + chalk.black.bgRed(k));

    const inqchuser = await inquirer.changeAddresses();

    if (inqchuser.addressChange === "Yes") {
        const res = await files.readWallet(true);
        w1 = res.wallet1;
        w2 = res.wallet2;
        k = res.pkey;
    }

};


const help = async () => {

    console.log(chalk.green("create / update") + ": Create a new SU or update the hashes of an existing one");
    console.log(chalk.green("stage") + ": Flag a SU for the collective blockchain synchronizing");
    console.log(chalk.green("close") + ": Close a SU and flag it for the collective blockchain synchronizing");
    console.log(chalk.green("syncwbc") + ": Synchronize the staged or closed SUs");
    console.log(chalk.green("checkbc") + ": Verify the integrity of a SU on the blockchain");
    console.log(chalk.green("checkfile") + ": Verify the integrity of a file / batch of files");
    console.log(chalk.green("export") + ": Export a a blockchain verifiable bundle");
    console.log(chalk.green("git") + ": Perform a custom Git command");
    console.log(chalk.green("settings") + ": Check the registered user information and change it");

};

init().then(r => {
});
