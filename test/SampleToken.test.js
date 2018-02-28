import { expect } from 'chai';
import web3 from './setupWeb3';

import compiledSampleToken from '../build/contracts/SampleToken.json';

import contractFactory from './contractFactory';

const tokenName = 'Sample Token';
const tokenSymbol = 'SAMT';
const tokenDecimals = '18';
const tokenSupply = '100';
const tokenTotalSupply = (
  parseInt(tokenSupply) *
  10 ** parseInt(tokenDecimals)
).toString();

const GAS = '1000000';

let accounts, sampleToken, contractOwner;
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
});

describe('Sample Token', () => {
  it('Should initialize a Sample Token Contract', async () => {
    const name = await sampleToken.methods.name().call();
    expect(name, 'Name did not match').to.equal(tokenName);

    const symbol = await sampleToken.methods.symbol().call();
    expect(symbol, 'Symbol did not match').to.equal(tokenSymbol);

    const decimals = await sampleToken.methods.decimals().call();
    expect(decimals, 'Decimals did not match').to.equal(tokenDecimals);

    const totalSupply = await sampleToken.methods.totalSupply().call();
    expect(totalSupply, 'Total Supply did not match').to.equal(
      tokenTotalSupply,
    );

    const balance = await sampleToken.methods.balanceOf(contractOwner).call();
    expect(balance, 'Balance did not match').to.equal(tokenTotalSupply);
  });

  it('Should transfer tokens from contract owner to another address', async () => {
    const fromAddress = contractOwner;
    const toAddress = accounts[1];
    const amount = '1000';

    const balanceOfFromBeforeTransfer = await sampleToken.methods
      .balanceOf(fromAddress)
      .call();

    const balanceOfToBeforeTransfer = await sampleToken.methods
      .balanceOf(toAddress)
      .call();

    const {
      events: { Transfer: { event, returnValues: { from, to, value } } },
    } = await sampleToken.methods
      .transfer(toAddress, amount)
      .send({ from: fromAddress, gas: GAS });

    expect(event, 'Event did not match').to.equal('Transfer');
    expect(from, 'From address did not match').to.equal(fromAddress);
    expect(to, 'To address did not match').to.equal(toAddress);
    expect(value, 'To address did not match').to.equal(amount);

    const balanceOfFromAfterTransfer = await sampleToken.methods
      .balanceOf(fromAddress)
      .call();

    const balanceOfToAfterTransfer = await sampleToken.methods
      .balanceOf(toAddress)
      .call();

    expect(
      parseInt(balanceOfFromAfterTransfer),
      'From Balance did not match',
    ).to.equal(parseInt(balanceOfFromBeforeTransfer) - parseInt(amount));

    expect(
      parseInt(balanceOfToAfterTransfer),
      'To Balance did not match',
    ).to.equal(parseInt(balanceOfToBeforeTransfer) + parseInt(amount));
  });

  it('Should approve and transfer to an approved addressed', async () => {
    const approverAddress = contractOwner;
    const approveeAddress = accounts[1];
    const allowance = '1000';

    const allowanceBeforeApproval = await sampleToken.methods
      .allowances(approverAddress, approveeAddress)
      .call();

    expect(allowanceBeforeApproval, 'Approve did not match').to.equal('0');

    let {
      events: { Approval: { event, returnValues: { owner, spender, value } } },
    } = await sampleToken.methods
      .approve(approveeAddress, allowance)
      .send({ from: approverAddress, gas: GAS });

    expect(event, 'Event did not match').to.equal('Approval');
    expect(owner, 'Approver address did not match').to.equal(approverAddress);
    expect(spender, 'Approvee address did not match').to.equal(approveeAddress);
    expect(value, 'Allowance did not match').to.equal(allowance);

    const allowanceAfterApproval = await sampleToken.methods
      .allowances(approverAddress, approveeAddress)
      .call();

    expect(allowanceAfterApproval, 'Allowance did not match').to.equal(
      allowance,
    );

    const balanceOfApproverBeforeTransfer = await sampleToken.methods
      .balanceOf(approverAddress)
      .call();

    const balanceOfApproveeBeforeTransfer = await sampleToken.methods
      .balanceOf(approveeAddress)
      .call();

    let from, to;
    ({
      events: { Transfer: { event, returnValues: { from, to, value } } },
    } = await sampleToken.methods
      .transferFrom(approverAddress, approveeAddress, allowance)
      .send({ from: approverAddress, gas: GAS }));

    expect(event, 'Event did not match').to.equal('Transfer');
    expect(from, 'Approver address did not match').to.equal(approverAddress);
    expect(to, 'Approvee address did not match').to.equal(approveeAddress);
    expect(value, 'To address did not match').to.equal(allowance);

    const balanceOfApproverAfterTransfer = await sampleToken.methods
      .balanceOf(approverAddress)
      .call();

    const balanceOfApproveeAfterTransfer = await sampleToken.methods
      .balanceOf(approveeAddress)
      .call();

    expect(
      parseInt(balanceOfApproverAfterTransfer),
      'Approver address balance did not match',
    ).to.equal(parseInt(balanceOfApproverBeforeTransfer) - parseInt(allowance));

    expect(
      parseInt(balanceOfApproveeAfterTransfer),
      'Approvee balance did not match',
    ).to.equal(parseInt(balanceOfApproveeBeforeTransfer) + parseInt(allowance));

    const allowanceAfterTransfer = await sampleToken.methods
      .allowances(approverAddress, approveeAddress)
      .call();

    expect(allowanceAfterTransfer, 'Allowance did not match').to.equal('0');
  });

  it('Should not allow an approval and transfer of a value that is greater than the approver address balance', async () => {
    'Should approve and transfer to an approved addressed',
      async () => {
        const approverAddress = contractOwner;
        const approveeAddress = accounts[1];
        const allowance = totalSupply + 1;

        await sampleToken.methods
          .approve(approveeAddress, allowance)
          .send({ from: approverAddress, gas: GAS });

        const { events } = await sampleToken.methods
          .transferFrom(approverAddress, approveeAddress, allowance)
          .send({ from: approverAddress, gas: GAS });

        //empty event indicates that an event was not emitted, thus the code operated as intended
        expect(events, 'Events was not empty').to.be.empty;
      };
  });

  it('Should not allow an transfer from an address to another address that has not been approved yet', async () => {
    'Should approve and transfer to an approved addressed',
      async () => {
        const approverAddress = contractOwner;
        const approveeAddress = accounts[1];
        const allowance = '1000';

        const { events } = await sampleToken.methods
          .transferFrom(approverAddress, approveeAddress, allowance)
          .send({ from: approverAddress, gas: GAS });

        //empty event indicates that an event was not emitted, thus the code operated as intended
        expect(events, 'Events was not empty').to.be.empty;
      };
  });
});
