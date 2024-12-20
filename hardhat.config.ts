import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const ALCHEMY_MAINNET_RPC = process.env.ALCHEMY_MAINNET_RPC || ''

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: ALCHEMY_MAINNET_RPC,
        blockNumber: 21423360
      }
    }
  }
};

export default config;
