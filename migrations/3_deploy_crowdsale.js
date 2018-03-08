const fs = require('fs');
const path = require('path');

const Crowdsale = artifacts.require('./Crowdsale.sol');
const SampleToken = artifacts.require('./SampleToken.sol');

let deployment = require('../deployment.json');

const crowdsaleRate = '1';

const { sampleTokenAddress } = deployment;

module.exports = async deployer => {
  const sampleToken = SampleToken.at(sampleTokenAddress);

  const totalSupply = await sampleToken.totalSupply();

  await deployer.deploy(
    Crowdsale,
    sampleTokenAddress,
    crowdsaleRate,
    totalSupply,
  );
  const { address } = Crowdsale;

  try {
    console.log('allocating tokens to the crowdsale contract...');
    await sampleToken.transfer(address, totalSupply);
    console.log('token allocation to crowdsale contract complete!');
  } catch (error) {
    console.log(error);
  }

  deployment.crowdsaleAddress = address;

  fs.writeFileSync(
    path.resolve(__dirname, '../deployment.json'),
    JSON.stringify(deployment),
    'utf-8',
  );
};
