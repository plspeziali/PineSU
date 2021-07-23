const Web3 = require('web3');
const web3 = new Web3('HTTP://127.0.0.1:7545');

web3.eth.getBalance('0x3a6990caE86a35a4022105b4c09DEF64908A0629').then(function(wei){
    const ethBalance = web3.utils.fromWei(wei, 'ether');
    console.log(ethBalance);
});

const address = "0x3a6990caE86a35a4022105b4c09DEF64908A0629";
const privateKey = "0xfb082a656d281ddb01d0395a94a0124e3f49c5b9fa7850adc85769c1672d9766";

const receiver = "0xCF23544bFC002905532bD86bF647754A84732966";

const deploy = async () => {
    console.log('Sending a transaction from '+address+' to '+receiver);
    const createTransaction = await web3.eth.accounts.signTransaction({
            from: address,
            to: receiver,
            data: web3.utils.utf8ToHex("Hello Worldd")+'',
            //value: web3.utils.toWei('10','ether'),
            gas: 30000,
        },
        privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    console.log(receipt);
    console.log('Transaction successfull with hash: '+createTransaction.messageHash+': '+web3.utils.utf8ToHex("Hello Worldd"));
    //console.log(web3.eth.accounts.recoverTransaction(createTransaction.rawTransaction));
    console.log(await web3.eth.getTransaction(receipt.transactionHash));
}
deploy();

/*const signObj = web3.eth.accounts.sign('ciaooo', '948d33b6d92f772cae76d747bae595035c1bbf0d086ff065a0e14a98d8d4c824')
console.log(signObj);
const ret = web3.eth.accounts.recover('ciaooo', "0x1b", "0xc1d5c0a154458f57d0b5e5b69a3cad31eaba46fba3bf6f5a4943258e29204d87", "0x4b5110bae179e97fe975d29f3bf39eb7857663fe3461967a15e9234a01af9f98");

console.log(ret);
*/

