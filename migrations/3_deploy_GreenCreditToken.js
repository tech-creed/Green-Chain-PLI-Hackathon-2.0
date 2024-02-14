const GreenCreditToken = artifacts.require("GreenCreditToken");

module.exports = function(deployer) {
  deployer.deploy(GreenCreditToken,200000000000, { gas: 6000000 })
}