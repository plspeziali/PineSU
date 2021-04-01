const Web3 = require('web3');

class Web3Connector{

    async createConnection(){
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        return;
    }

    createContract (address){
        const contractJSON = JSON.parse(fs.readFileSync('../blockchain/build/contracts/SURegistry.json'), 'utf8');
        const abi = contractJSON.abi;
        this.contract = web3.eth.Contract(abi, address);
    }

    registerSU (hash, owner){
        this.contract.methods.register(web3.utils.asciiToHex(hash), web3.utils.asciiToHex(owner)).send();
    }

    verifySU (hash, owner){
        return this.contract.methods.verify(web3.utils.asciiToHex(hash), web3.utils.asciiToHex(owner)).call( function(error, result){
            return result;
        });
    }

}

module.exports = Web3Connector;
