const fs = require('fs');
const path = require('path');

const SampleToken = artifacts.require('./SampleToken.sol');

const tokenName = 'Sample Token';
const tokenSymbol = 'SAMT';
const tokenDecimals = '18';
const tokenSupply = '100';

module.exports = async deployer => {
  await deployer.deploy(
    SampleToken,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenSupply,
  );

  const { address } = SampleToken;
  let deployment = {};

  deployment.sampleTokenAddress = address;

  fs.writeFileSync(
    path.resolve(__dirname, '../deployment.json'),
    JSON.stringify(deployment),
    'utf8',
  );
};
