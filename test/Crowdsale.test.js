import { expect } from 'chai';

import web3 from './setupWeb3';

import compiledSampleToken from '../build/contracts/SampleToken.json';
import compiledCrowdsale from '../build/contracts/Crowdsale.json';
import contractFactory from './contractFactory';

//sample token parameters
const tokenName = 'Sample Token';
const tokenSymbol = 'SAMT';
const tokenDecimals = '18';
const tokenSupply = '5';
const totalTokenSupply = (
  parseInt(tokenSupply) *
  10 ** parseInt(tokenDecimals)
).toString();

//crowdsale parameters
const crowdsaleRate = '1';

const GAS = '1000000';
const GAS_PRICE_GWEI = '20';
const GAS_PRICE = web3.utils.toWei(GAS_PRICE_GWEI, 'gwei');

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

  it('Should allow tokens to be purchased and emit a TokensPurchased event', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleTokenAmount =
      Number.parseInt(weiContribution) * crowdsaleRate;
    const crowdsaleContributor = accounts[1];

    const balanceBeforeContribution = await web3.eth.getBalance(
      crowdsaleContributor,
    );

    const tokensAvailableBeforePurchase = await crowdsale.methods
      .tokensAvailable()
      .call();

    const allocationBeforePurchase = await crowdsale.methods
      .allocations(crowdsaleContributor)
      .call();

    const weiRaisedBeforePurchase = await crowdsale.methods.weiRaised().call();

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    //checks that the account balance was updated correctly
    const balanceAfterContribution = await web3.eth.getBalance(
      crowdsaleContributor,
    );
    expect(
      Number.parseInt(balanceAfterContribution),
      'Balance did not match',
    ).to.be.at.most(
      Number.parseInt(balanceBeforeContribution) -
        Number.parseInt(weiContribution),
    );

    //checks that tokens available was updated correctly
    const tokensAvailableAfterPurchase = await crowdsale.methods
      .tokensAvailable()
      .call();
    expect(
      tokensAvailableAfterPurchase,
      'Tokens available did not match',
    ).to.equal(
      (
        Number.parseInt(tokensAvailableBeforePurchase) -
        Number.parseInt(crowdsaleTokenAmount)
      ).toString(),
    );

    //checks that the allocation was updated correctly
    const allocationAfterPurchase = await crowdsale.methods
      .allocations(crowdsaleContributor)
      .call();
    expect(allocationAfterPurchase).to.equal(
      (
        Number.parseInt(allocationBeforePurchase) + crowdsaleTokenAmount
      ).toString(),
    );

    //checks that the wei raised is updated correctly
    const weiRaisedAfterPurchase = await crowdsale.methods.weiRaised().call();
    expect(weiRaisedAfterPurchase, 'Wei raised did not match').to.equal(
      (
        Number.parseInt(weiRaisedBeforePurchase) +
        Number.parseInt(weiContribution)
      ).toString(),
    );

    const [
      { topics: [, purchaserHexString, amountHexString, allocationHexString] },
    ] = await web3.eth.getPastLogs({
      address: crowdsaleAddress,
      topics: [
        web3.utils.keccak256('TokensPurchased(address,uint256,uint256)'),
      ],
    });

    const purchaser = web3.utils.toChecksumAddress(
      purchaserHexString.replace(/0x0*/, '0x'),
    );
    const amount = parseInt(amountHexString, 16).toString();
    const allocation = parseInt(allocationHexString, 16).toString();

    expect(purchaser, 'Contributor address did not match').to.equal(
      crowdsaleContributor,
    );
    expect(amount, 'Amount did not match').to.equal(
      crowdsaleTokenAmount.toString(),
    );
    expect(allocation, 'Allocation did not match').to.equal(
      allocationAfterPurchase,
    );
  });

  it('Should not allow tokens to be purchased than are available', async () => {
    const contribution = 6; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    let crowdsaleContributor = accounts[2];

    const { status } = await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    expect(status, 'Status did not match').to.equal('0x00');

    const [, undefinedLog] = await web3.eth.getPastLogs({
      fromBlock: '0x0',
      address: crowdsaleAddress,
      topics: [
        web3.utils.keccak256('TokensPurchased(address,uint256,uint256)'),
      ],
    });

    expect(undefinedLog, 'Log was not undefined').to.be.undefined;
  });

  it('Should allow purchased tokens to be claimed and emit a TokensClaimed event', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleTokenAmount =
      Number.parseInt(weiContribution) * crowdsaleRate;
    const crowdsaleContributor = accounts[1];

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    const {
      events: { TokensClaimed: { returnValues: { receiver, amount } } },
    } = await crowdsale.methods
      .claimTokens(crowdsaleTokenAmount)
      .send({ from: crowdsaleContributor, gas: GAS });
    expect(receiver, 'Claimer address did not match').to.equal(
      crowdsaleContributor,
    );
    expect(amount, 'Claimed amount did not match').to.equal(
      crowdsaleTokenAmount.toString(),
    );

    const balance = await sampleToken.methods
      .balanceOf(crowdsaleContributor)
      .call();
    expect(balance, 'Claimer balance did not match').to.equal(
      crowdsaleTokenAmount.toString(),
    );
  });

  it('Should not allow more tokens to be claimed than purchased', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleTokenAmount =
      Number.parseInt(weiContribution) * crowdsaleRate;
    const crowdsaleContributor = accounts[1];

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    const BN_CONST_1 = web3.utils.toBN(1);

    const claimTokenAmount = web3.utils
      .toBN(crowdsaleTokenAmount)
      .add(BN_CONST_1)
      .toString();

    const { status } = await crowdsale.methods
      .claimTokens(claimTokenAmount)
      .send({ from: crowdsaleContributor, gas: GAS });

    expect(status, 'Status did not match').to.equal('0x00');

    const balance = await sampleToken.methods
      .balanceOf(crowdsaleContributor)
      .call();
    expect(balance, 'Claimer balance did not match').to.equal('0');
  });

  it('Should allow contract owner to withdraw ETH from the crowdsale', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleTokenAmount =
      Number.parseInt(weiContribution) * crowdsaleRate;
    const crowdsaleContributor = accounts[1];

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    const balanceBeforeWithdrawl = await web3.eth.getBalance(contractOwner);

    const {
      events: { FundsWithdrawn: { returnValues: { amount } } },
    } = await crowdsale.methods
      .withdrawFunds(weiContribution)
      .send({ from: contractOwner, gas: GAS, gasPrice: GAS_PRICE });

    expect(amount, 'Withdrawn amount did not match').to.equal(weiContribution);

    const balanceAfterWithdrawl = await web3.eth.getBalance(contractOwner);

    expect(
      parseInt(balanceAfterWithdrawl),
      'Balance of contract owner did not match',
    )
      .to.be.least(
        parseInt(balanceBeforeWithdrawl) -
          parseInt(weiContribution) -
          parseInt(GAS) * parseInt(GAS_PRICE),
      )
      .and.to.be.greaterThan(parseInt(balanceBeforeWithdrawl));
  });

  it('Should not allow contract owner to withdraw more ETH from the crowdsale than was contributed', async () => {
    const contribution = 1; //ETH
    const weiContribution = web3.utils.toWei(contribution.toString(), 'ether');
    const crowdsaleContributor = accounts[1];

    await web3.eth.sendTransaction({
      from: crowdsaleContributor,
      to: crowdsaleAddress,
      value: weiContribution,
      gas: GAS,
    });

    const weiRaisedBeforeWithdrawl = await crowdsale.methods.weiRaised().call();
    const balanceBeforeWithdrawl = await web3.eth.getBalance(contractOwner);

    const BN_CONST_1 = web3.utils.toBN(1);

    const withdrawAmount = web3.utils
      .toBN(weiContribution)
      .add(BN_CONST_1)
      .toString();

    const { status } = await crowdsale.methods
      .withdrawFunds(withdrawAmount)
      .send({ from: contractOwner, gas: GAS });

    expect(status, 'Status did not match').to.equal('0x00');

    const weiRaisedAfterWithdrawl = await crowdsale.methods.weiRaised().call();
    const balanceAfterWithdrawl = await web3.eth.getBalance(contractOwner);

    expect(weiRaisedAfterWithdrawl, 'Wei raised did not match').to.equal(
      weiRaisedBeforeWithdrawl,
    );
    expect(parseInt(balanceAfterWithdrawl), 'Balance of contract owner ')
      .to.be.at.most(parseInt(balanceBeforeWithdrawl))
      .and.to.be.at.least(
        parseInt(balanceBeforeWithdrawl) - parseInt(GAS) * parseInt(GAS_PRICE),
      );
  });
});
