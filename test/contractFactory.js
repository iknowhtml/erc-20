import web3 from './setupWeb3';

async function contractFactory(
  compiledContract,
  account,
  ...contractArguments
) {
  const contractInstance = await new web3.eth.Contract(compiledContract.abi)
    .deploy({
      data: compiledContract.bytecode,
      arguments: contractArguments,
    })
    .send({ from: account, gas: '4700000' });

  contractInstance.setProvider(web3.currentProvider);

  return contractInstance;
}

export default contractFactory;
