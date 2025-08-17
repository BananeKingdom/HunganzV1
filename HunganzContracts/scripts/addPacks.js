import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Simple ABI for the addPackType function
const HUNGANZ_ABI = [
  "function addPackType(uint256 fromTypeIndex, uint256 toTypeIndex) external"
];

async function main() {
  console.log("🎁 Adding pack types for Hunganz...");

  const contractAddress = process.env.HUNGANZ_CONTRACT_ADDRESS;
  const privateKey = process.env.FLOW_PRIVATE_KEY;
  
  if (!contractAddress) {
    throw new Error("HUNGANZ_CONTRACT_ADDRESS not found in .env file");
  }
  
  if (!privateKey) {
    throw new Error("FLOW_PRIVATE_KEY not found in .env file");
  }

  console.log(`📋 Using contract at: ${contractAddress}`);

  // Connect to Flow mainnet
  const provider = new ethers.JsonRpcProvider("https://mainnet.evm.nodes.onflow.org");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`🔑 Using admin account: ${wallet.address}`);
  
  // Get the contract instance
  const hunganzContract = new ethers.Contract(contractAddress, HUNGANZ_ABI, wallet);

  try {
    // Pack Type 0: Basic Pack (contains any of the first 3 types: 0, 1, 2)
    console.log("\n🎯 Adding Basic Pack (Type 0)...");
    const tx = await hunganzContract.addPackType(0, 2);
    await tx.wait();
    console.log(`✅ Basic Pack added! Tx: ${tx.hash}`);

    console.log("\n🎉 Basic pack type added successfully!");
    console.log("📦 Pack Type 0: Basic Pack (can contain FireBob, PlantJimmy, or WaterNolan)");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
