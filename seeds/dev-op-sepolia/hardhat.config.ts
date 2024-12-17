
    import { HardhatUserConfig } from "hardhat/config";
    import "@nomicfoundation/hardhat-toolbox";
    import "@nomicfoundation/hardhat-ignition-ethers";

    const config: HardhatUserConfig = {
      solidity: "0.8.24",
      networks: {
        opSepolia: {
          url: "https://optimism-mainnet.infura.io/v3/d2661f99b84a4409ac77e3f888e981ce",
          accounts: [
            "9cbf731c61b2712fec14a07e474bfd9f49a51ad7918f3dcd2765fd8c230daa53",
          ]
        },
      },
      
      etherscan: {
        apiKey: {
          opSepolia: "VXEY2ISXJ1AVFCX9ZJGVNI77PG6DC917C3"
        },
        
        customChains: [
          {
            network: "opSepolia",
            chainId: 11155420,
            urls: {
              apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
              browserURL: "https://sepolia-optimism.etherscan.io"
            }
          }
        ]
    
      }
    
    };

    export default config;

    