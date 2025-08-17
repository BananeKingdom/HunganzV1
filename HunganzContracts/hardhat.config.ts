import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    flowMainnet: {
      type: "http",
      chainType: "l1",
      url: "https://mainnet.evm.nodes.onflow.org",
      chainId: 747,
      accounts: configVariable("FLOW_PRIVATE_KEY") ? [configVariable("FLOW_PRIVATE_KEY")] : [],
    },
    flowTestnet: {
      type: "http",
      chainType: "l1",
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: configVariable("FLOW_PRIVATE_KEY") ? [configVariable("FLOW_PRIVATE_KEY")] : [],
    },
  },
};

export default config;
