const Web3 = require('web3');

class EthConnector {

    #web3;
    #w1;
    #w2;
    #k;

    constructor(host, w1, w2, k) {
        this.#web3 = new Web3(host); //'HTTP://127.0.0.1:7545'
        this.#w1 = w1;
        this.#w2 = w2;
        this.#k = k;
    }

    async deploy(hashRoot) {
        console.log('Sending a transaction from ' + this.#w1 + ' to ' + this.#w2);
        const createTransaction = await this.#web3.eth.accounts.signTransaction({
                from: this.#w1,
                to: this.#w2,
                data: hashRoot + '',
                //value: web3.utils.toWei('10','ether'),
                gas: 3000000,
            },
            this.#k
        );
        const receipt = await this.#web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
        //console.log(receipt);
        //console.log('Transaction successfull with hash: '+createTransaction.messageHash+': '+web3.utils.utf8ToHex("Hello Worldd"));
        //console.log(web3.eth.accounts.recoverTransaction(createTransaction.rawTransaction));
        //console.log(await web3.eth.getTransaction(receipt.transactionHash));
        return receipt.transactionHash;
    }

    async verifyHash(transactionHash, hash, w1) {
        const res = await this.#web3.eth.getTransaction(transactionHash)
        console.log(res);
        console.log(w1);
        if (res.input == "0x" + hash && res.from.toUpperCase() == w1.toUpperCase()) {
            return [res.from.toUpperCase() + w1.toUpperCase(), true];
        } else {
            return [res.from.toUpperCase() + w1.toUpperCase(), false];
        }
    }
}

module.exports = EthConnector;