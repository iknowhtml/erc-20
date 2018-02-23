const Token = artifacts.require('./Token.sol');

module.exports = () => {
  Deployer.deploy(Token);
};
