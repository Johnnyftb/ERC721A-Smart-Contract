require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require("hardhat-gas-reporter");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  gasReporter: {
    enabled: true,
    currency: "ETH",
    outputFile: "gas-report.txt",
    noColors: true
  }
};
