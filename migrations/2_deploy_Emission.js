const Emission = artifacts.require("Emission");

module.exports = function(deployer) {
  deployer.deploy(Emission)
}