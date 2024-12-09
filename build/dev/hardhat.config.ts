
    import { HardhatUserConfig } from "hardhat/config";
    import "@nomicfoundation/hardhat-toolbox";
    import "@nomicfoundation/hardhat-ignition-ethers";

    const config: HardhatUserConfig = {
      solidity: "0.8.24",
      networks: {
        localhost: {
          url: "http://localhost:8545/",
          accounts: [
            "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
          ]
        },
      },
      
    };

    export default config;

    