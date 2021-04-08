var news = artifacts.require("./news.sol");
var regsu = artifacts.require("./SURegistry.sol");

module.exports = function(deployer) {

    deployer.deploy(news);
    deployer.deploy(regsu);

};