const fs = require('fs');
const path = require('path');

const Token = artifacts.require('./SampleToken.sol');

module.exports = async deployer => {
  await deployer.deploy(Token);

  const { address } = Token;
  let deployment = {};

  deployment.sampleTokenAddress = address;

  fs.writeFileSync(
    path.resolve(__dirname, '../deployment.json'),
    JSON.stringify(deployment),
    'utf8',
  );
};
