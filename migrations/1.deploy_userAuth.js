const UserAuth_Contract = artifacts.require("UserAuth");

module.exports = function(deployer) {
  deployer.deploy(UserAuth_Contract);
};