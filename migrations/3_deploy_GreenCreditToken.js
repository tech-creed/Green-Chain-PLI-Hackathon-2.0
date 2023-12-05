const GreenCreditToken = artifacts.require("GreenCreditToken");

module.exports = function(deployer) {
  deployer.deploy(GreenCreditToken,2000000000000000)
}