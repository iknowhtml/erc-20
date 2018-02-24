import { assert, expect, should } from 'chai';
import Web3 from 'web3';

import compiledToken from '../build/contracts/Token.json';

const RPC_SERVER = 'http://localhost:7545';
const web3 = new Web3(RPC_SERVER);

let accounts, factory, tokenAddress, token;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  token = await new web3.eth.Contract(compiledToken.abi)
    .deploy({ data: compiledToken.bytecode })
    .send({ from: accounts[0], gas: '4700000' });

  token.setProvider(web3.currentProvider);
});

describe('Token', () => {
  it('Should initialize a token', async () => {
    assert(token.options.address, "address doesn't exist");
    const balance = await token.methods.totalSupply().call();
    expect(balance, "balance wasn't initialized correctly").to.equal('0');
  });
});
