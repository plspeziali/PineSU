const clear = require('clear');
const {v4: uuidv4} = require("uuid");
const files = require("../lib/files");
const ethLogic = require("../logic/ethLogic");
const gitLogic = require("../logic/gitLogic");
const {performance} = require("perf_hooks");
let w1, w2, k, mc, sg;

clear();

const init = async () => {
    const res = await files.readWallet(false);
    w1 = res.wallet1;
    w2 = res.wallet2;
    k = res.pkey;

    const ethHost = "HTTP://127.0.0.1:7545";

    ethLogic.connect(w1, w2, k, ethHost.host);

    mc = files.loadTree();

    sg = files.loadSG();

    await create();
}

const create = async () => {

    const start = performance.now()

    // Controllo d'esistenza di repository Git con creazione in caso contrario
    if (files.fileExists('.git')) {
        //console.log('Already a Git repository!');
    } else {
        gitLogic.init();
    }
    const filelist = await gitLogic.calculateSU();
    //console.log(filelist);

    if (filelist[0] === "null") {
        //console.log("No files could be added");
        return;
    }

    // Calcolo del Merkle Tree della SU
    const merkleroot = gitLogic.calculateTree(filelist);
    //console.log("All files added");

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
    const pineSUFile = {};
    pineSUFile.hash = null;
    pineSUFile.header = {};

    pineSUFile.header.uuid = uuidSU;
    pineSUFile.header.remote = remote;
    pineSUFile.header.owner = w1;
    pineSUFile.header.name = files.getCurrentDirectoryBase();
    pineSUFile.header.description = "";
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
    //console.log("The Storage Unit has been created!");

    // commit includendo
    // anche il file descrittore JSON
    await gitLogic.addAllSU();

    await gitLogic.commitSU("");

    const end = performance.now()

    console.log((end - start).toString());

};

init().then();