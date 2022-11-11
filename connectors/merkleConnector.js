import * as mc from 'merkle-calendar'

class MerkleConnector {

    #merkleCalendar

    constructor() {
        this.#merkleCalendar = new mc.MerkleCalendar();
    }

    addRegistration(name, hash, timestamp, closed, storageGroup, mHash, yHash){
        let sg = new mc.StorageGroup();
        for(el of storageGroup){
            let su = new mc.StorageUnit(el.hash, el.uuid);
            sg.addToSG(su);
        }
        sg.calculateHash();
        this.#merkleCalendar.addRegistration(name, hash, timestamp, closed, sg, null, null);
    }



}

module.exports = MerkleConnector;