const clear = require('clear');
const files = require("../lib/files");
const ethLogic = require("../logic/ethLogic");
const gitLogic = require("../logic/gitLogic");
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

    await register();
}

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
        console.log("There are no Storage Units staged!");
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