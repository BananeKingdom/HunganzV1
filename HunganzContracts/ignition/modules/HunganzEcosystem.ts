import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HunganzEcosystemModule = buildModule("HunganzEcosystemModule", (m) => {
  // Flow randomness beacon address (precompiled contract)
  // This is the actual Flow randomness beacon EVM precompiled contract address
  const flowRandomnessAddress = m.getParameter("flowRandomnessAddress", "0x0000000000000000000000010000000000000001");

  // Deploy BananeV1 with 1M initial tokens (1,000,000 * 10^18)
  const initialSupply = m.getParameter("initialSupply", 1000000n * 10n ** 18n);
  const bananeV1 = m.contract("BananeV1", [initialSupply]);

  // Deploy HunganzV1 contract with Flow randomness beacon
  const hunganzV1 = m.contract("HunganzV1", [flowRandomnessAddress, bananeV1]);

  // Configure BananeV1 to allow HunganzV1 to mint/burn tokens
  m.call(bananeV1, "addHunganzContract", [hunganzV1]);

  // Log deployment info (addresses will be shown by Hardhat Ignition after deployment)
  console.log("\n🚀 Deploying Hunganz Ecosystem...");
  console.log("🍌 BananeV1 (ERC20 Token) - Initial Supply: 1,000,000 tokens");
  console.log("🦄 HunganzV1 (Gaming NFT) - Using Flow Randomness Beacon");
  console.log("🔗 Configuring BananeV1 to authorize HunganzV1 as minter");
  console.log("\nℹ️ After deployment, copy the HunganzV1 address to your .env file:");
  console.log("   HUNGANZ_CONTRACT_ADDRESS=<deployed_address>");
  console.log("\n✅ Then run: npm run ipfs:batch");

  return { 
    hunganzV1, 
    bananeV1
  };
});

export default HunganzEcosystemModule;
