# ERC-20 Token Implementation

A custom ERC-20 implementation.

## Getting Started

Download the repository and install necessary dependencies for the project by running the commands below:

```
git clone https://github.com/iknowhtml/erc-20.git
cd erc-20
yarn install
```

## Using the Smart contracts

To compile the contracts run the command below:
``yarn compile```

To run tests please run the command below (please make sure the contracts are compiled first with the above command):
`yarn test`

Finally, to deploy, please run the command below:
`yarn deploy --network <NETWORK>`
example:
`yarn deploy --network ganache`

Additional networks can be added by modifying the `truffle.js` file in the root directory.

**NOTE:** Please make sure you have [Ganache](http://truffleframework.com/ganache/) before running tests or deploying to the `ganache` network.
