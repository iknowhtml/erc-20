import { assert, expect, should } from 'chai';
import web3 from './setupWeb3';

import compiledToken from '../build/contracts/Token.json';

import contractFactory from './contractFactory';

let accounts, token;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  token = await contractFactory(compiledToken);
});

describe('Token', () => {
  it('Should initialize a token', async () => {
    assert(token.options.address, "address doesn't exist");
    const balance = await token.methods.totalSupply().call();
    expect(balance, "balance wasn't initialized correctly").to.equal('0');
  });
});
