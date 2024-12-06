/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 2000
      }
    }
  }
};
