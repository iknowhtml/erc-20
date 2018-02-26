import { expect } from 'chai';
import web3 from './setupWeb3';

import compiledOwnable from '../build/contracts/Ownable.json';

import contractFactory from './contractFactory';

let accounts, ownable, contractOwner;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  contractOwner = accounts[0];
  ownable = await contractFactory(compiledOwnable, contractOwner);
});

describe('Ownable', () => {
  it('Should initialize an Ownable contract to be owned by the correct owner', async () => {
    const owner = await ownable.methods.owner().call();
    expect(owner, 'Owner did not match').to.equal(contractOwner);
  });

  it('Should transfer ownership to a different owner and emit an OwnershipTransfered event', async () => {
    const newContractOwner = accounts[1];
    const {
      events: {
        OwnershipTransfered: {
          event,
          returnValues: { newOwner, previousOwner },
        },
      },
    } = await ownable.methods
      .transferOwnership(newContractOwner)
      .send({ from: contractOwner, gas: '1000000' });

    expect(event, 'Event did not match').to.equal('OwnershipTransfered');
    expect(newOwner, 'Owner did not match').to.equal(newContractOwner);
    expect(previousOwner, 'Owner did not match').to.equal(contractOwner);
    const owner = await ownable.methods.owner().call();

    expect(owner, 'Owner did not match').to.equal(newContractOwner);
  });

  it('Should fail transferring ownership to 0x0', async () => {
    const { events } = await ownable.methods
      .transferOwnership('0x0')
      .send({ from: contractOwner, gas: '1000000' });

    expect(events, 'Event was not empty').to.be.empty;

    const owner = await ownable.methods.owner().call();

    expect(owner, 'Owner did not match').to.equal(contractOwner);
  });

  it('Should fail transferring ownership to current contract owner', async () => {
    const { events } = await ownable.methods
      .transferOwnership(contractOwner)
      .send({ from: contractOwner, gas: '1000000' });

    expect(events, 'Event was not empty').to.be.empty;

    const owner = await ownable.methods.owner().call();

    expect(owner, 'Owner did not match').to.equal(contractOwner);
  });

  it('Should fail transferring ownership from an account that is not the current contract owner', async () => {
    const differentOwner = accounts[1];
    const { events } = await ownable.methods
      .transferOwnership(differentOwner)
      .send({ from: differentOwner, gas: '1000000' });

    expect(events, 'Event was not empty').to.be.empty;

    const owner = await ownable.methods.owner().call();

    expect(owner, 'Owner did not match').to.equal(contractOwner);
  });
});
