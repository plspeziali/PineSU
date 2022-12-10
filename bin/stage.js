const clear = require('clear');
const {v4: uuidv4} = require("uuid");
const files = require("../lib/files");
const ethLogic = require("../logic/ethLogic");
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

    await stage();
}

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

init().then();