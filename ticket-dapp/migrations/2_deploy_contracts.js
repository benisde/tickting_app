var Ticket = artifacts.require("./Ticket.sol");

module.exports = function(deployer) {
  deployer.deploy(Ticket);
};

