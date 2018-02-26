import web3 from './setupWeb3';

async function timeTravel(seconds) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [seconds],
        id: new Date().getTime(),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );
  });
}

async function mineBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: new Date().getTime(),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );
  });
}

// /** Test **/
// (async () => {
//   let { timestamp: time } = await web3.eth.getBlock('latest');
//   console.log(time);
//   await timeTravel(3 * 86400);
//   await mineBlock();
//   ({ timestamp: time } = await web3.eth.getBlock('latest'));
//   console.log(time);
// })();

export { timeTravel, mineBlock };
