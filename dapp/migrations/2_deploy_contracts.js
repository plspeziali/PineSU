var news = artifacts.require("./news.sol");
var regsu = artifacts.require("./RegistrySU.sol");

module.exports = function(deployer) {

    deployer.deploy(news);
    deployer.deploy(regsu);

};