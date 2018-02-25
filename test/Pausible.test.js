import { assert, expect, should } from 'chai';
import web3 from './setupWeb3';

import compiledPausible from '../build/contracts/Pausible.json';

import contractFactory from './contractFactory';

let accounts, pausible, contractOwner, paused;

const GAS = '1000000';

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  contractOwner = accounts[0];
  pausible = await contractFactory(compiledPausible, contractOwner);
});

describe('Pausible', () => {
  it('Should initialize an Pausible contract with the contract not paused', async () => {
    const paused = await pausible.methods.paused().call();
    expect(paused, 'Contract was not initialized properly').to.equal(false);
  });

  it('Should pause the contract and emit a Paused event', async () => {
    const {
      events: { Paused: { event } },
    } = await pausible.methods.pause().send({ from: contractOwner, gas: GAS });

    expect(event, 'Event was not correct').to.equal('Paused');

    const paused = await pausible.methods.paused().call();

    expect(paused, 'Contract was not paused').to.equal(true);
  });

  it('Should unpause the contract and emit a Unpaused event', async () => {
    //setup
    await pausible.methods.pause().send({ from: contractOwner, gas: GAS });

    const {
      events: { Unpaused: { event } },
    } = await pausible.methods
      .unpause()
      .send({ from: contractOwner, gas: GAS });

    expect(event, 'Event was not correct').to.equal('Unpaused');

    const paused = await pausible.methods.paused().call();

    expect(paused, 'Contract was not unpaused').to.equal(false);
  });

  it('Should not pause an paused contract', async () => {
    //setup
    await pausible.methods.pause().send({ from: contractOwner, gas: GAS });

    const { events } = await pausible.methods
      .pause()
      .send({ from: contractOwner, gas: GAS });

    expect(events, 'Events was not empty').to.be.empty;

    const paused = await pausible.methods.paused().call();

    expect(paused, 'Contract was not unpaused').to.equal(true);
  });

  it('Should not unpause an unpaused contract', async () => {
    //setup
    await pausible.methods.pause().send({ from: contractOwner, gas: GAS });
    await pausible.methods.unpause().send({ from: contractOwner, gas: GAS });

    const { events } = await pausible.methods
      .unpause()
      .send({ from: contractOwner, gas: GAS });

    expect(events, 'Events was not empty').to.be.empty;

    const paused = await pausible.methods.paused().call();

    expect(paused, 'Contract was not unpaused').to.equal(false);
  });
});
