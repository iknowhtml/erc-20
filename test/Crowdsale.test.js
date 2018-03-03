import { expect } from 'chai';

import web3 from './setupWeb3';

import compiledSampleToken from '../build/contracts/SampleToken.json';
import compiledCrowdsale from '../build/contracts/Crowdsale.json';
import contractFactory from './contractFactory';

//sample token parameters
const tokenName = 'Sample Token';
const tokenSymbol = 'SAMT';
const tokenDecimals = '18';
const tokenSupply = '100';
const totalTokenSupply = (
  parseInt(tokenSupply) *
  10 ** parseInt(tokenDecimals)
).toString();

//crowdsale parameters
const crowdsaleRate = '1';

const GAS = '1000000';

let accounts,
  sampleToken,
  sampleTokenAddress,
  crowdsale,
  crowdsaleAddress,
  contractOwner;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  contractOwner = accounts[0];

  sampleToken = await contractFactory(
    compiledSampleToken,
    contractOwner,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenSupply,
  );

  ({ _address: sampleTokenAddress } = sampleToken);

  crowdsale = await contractFactory(
    compiledCrowdsale,
    contractOwner,
    sampleTokenAddress,
    crowdsaleRate,
    totalTokenSupply,
  );

  ({ _address: crowdsaleAddress } = crowdsale);

  await sampleToken.methods
    .transfer(crowdsaleAddress, totalTokenSupply)
    .send({ from: contractOwner, gas: GAS });
});

describe('Crowdsale', () => {
  it('Should initialize a Crowdsale', async () => {
    const rate = await crowdsale.methods.rate().call();
    expect(rate, 'Rate did not match').to.equal(crowdsaleRate);

    const tokensAvailable = await crowdsale.methods.tokensAvailable().call();
    expect(tokensAvailable, 'Tokens available did not match').to.equal(
      totalTokenSupply,
    );

    const contractBalance = await sampleToken.methods
      .balanceOf(crowdsaleAddress)
      .call();
    expect(contractBalance, 'Contract balance did not match').to.equal(
      totalTokenSupply,
    );
  });

  it('Should purchase tokens and emit TokensPurchased event', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleTokenAmount =
      Number.parseInt(weiContribution) * crowdsaleRate;
    const crowdsaleContributor = accounts[1];
    const balanceBeforeContribution = web3.eth.getBalance(crowdsaleContributor);

    const tokensAvailableBeforePurchase = await crowdsale.methods
      .tokensAvailable()
      .call();

    const allocationBeforePurchase = await crowdsale.methods
      .allocations(crowdsaleContributor)
      .call();

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    const tokensAvailableAfterPurchase = await crowdsale.methods
      .tokensAvailable()
      .call();

    const allocationAfterPurchase = await crowdsale.methods
      .allocations(crowdsaleContributor)
      .call();

    expect(allocationAfterPurchase).to.equal(
      (
        Number.parseInt(allocationBeforePurchase) + crowdsaleTokenAmount
      ).toString(),
    );
  });
});
