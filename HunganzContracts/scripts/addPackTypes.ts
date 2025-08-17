import hre from "hardhat";
import type { HunganzV1 } from "../typechain-types/contracts/HunganzV1.js";

async function main() {
  console.log("🎁 Adding pack types for the first three Hunga types...");

  // Get the deployed contract address from environment or deployment
  const HUNGANZ_CONTRACT_ADDRESS = process.env.HUNGANZ_V1_ADDRESS;
  
  if (!HUNGANZ_CONTRACT_ADDRESS) {
    throw new Error("HUNGANZ_V1_ADDRESS not found in environment variables");
  }

  // Get the contract instance
  const hunganzContract = await hre.ethers.getContractAt("HunganzV1", HUNGANZ_CONTRACT_ADDRESS) as HunganzV1;
  
  console.log(`📋 Connected to HunganzV1 contract at: ${HUNGANZ_CONTRACT_ADDRESS}`);

  // Get the signer (deployer)
  const [deployer] = await hre.ethers.getSigners();
  console.log(`🔑 Using deployer account: ${deployer.address}`);

  try {
    // Pack Type 0: Basic Pack (contains any of the first 3 types: FireBob, PlantJimmy, WaterNolan)
    console.log("\n🎯 Adding Basic Pack (Type 0)...");
    const tx1 = await hunganzContract.addPackType(0, 2); // fromTypeIndex: 0, toTypeIndex: 2 (includes types 0, 1, 2)
    await tx1.wait();
    console.log(`✅ Basic Pack added! Transaction: ${tx1.hash}`);

    // Pack Type 1: Fire Pack (only FireBob - type 0)
    console.log("\n🔥 Adding Fire Pack (Type 1)...");
    const tx2 = await hunganzContract.addPackType(0, 0); // fromTypeIndex: 0, toTypeIndex: 0 (only FireBob)
    await tx2.wait();
    console.log(`✅ Fire Pack added! Transaction: ${tx2.hash}`);

    // Pack Type 2: Plant Pack (only PlantJimmy - type 1)
    console.log("\n🌱 Adding Plant Pack (Type 2)...");
    const tx3 = await hunganzContract.addPackType(1, 1); // fromTypeIndex: 1, toTypeIndex: 1 (only PlantJimmy)
    await tx3.wait();
    console.log(`✅ Plant Pack added! Transaction: ${tx3.hash}`);

    // Pack Type 3: Water Pack (only WaterNolan - type 2)
    console.log("\n💧 Adding Water Pack (Type 3)...");
    const tx4 = await hunganzContract.addPackType(2, 2); // fromTypeIndex: 2, toTypeIndex: 2 (only WaterNolan)
    await tx4.wait();
    console.log(`✅ Water Pack added! Transaction: ${tx4.hash}`);

    console.log("\n🎉 All pack types have been successfully added!");
    console.log("\n📦 Pack Types Summary:");
    console.log("  - Pack Type 0: Basic Pack (FireBob, PlantJimmy, or WaterNolan)");
    console.log("  - Pack Type 1: Fire Pack (FireBob only)");
    console.log("  - Pack Type 2: Plant Pack (PlantJimmy only)");
    console.log("  - Pack Type 3: Water Pack (WaterNolan only)");

  } catch (error: any) {
    console.error("❌ Error adding pack types:", error);
    
    if (error.message.includes("Invalid type index")) {
      console.error("💡 Make sure the Hunga types (FireBob, PlantJimmy, WaterNolan) have been added to the contract first!");
      console.error("💡 Run the character upload script if you haven't already.");
    }
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.error("💡 Make sure you're using the owner account that deployed the contract.");
    }
    
    process.exit(1);
  }
}

// Handle script execution
main()
  .then(() => {
    console.log("\n✨ Pack types setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
