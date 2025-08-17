#!/usr/bin/env node

/**
 * Hunganz IPFS Image Uploader and Contract Updater
 * 
 * This utility:
 * 1. Scans the images/ directory for character evolution images
 * 2. Uploads images to IPFS using Pinata
 * 3. Updates the HunganzV1 contract with the IPFS URIs
 * 
 * Expected directory structure:
 * images/
 * ├── FireDragon/
 * │   ├── 1.png (evolution 0)
 * │   ├── 2.png (evolution 1)
 * │   ├── 3.png (evolution 2)
 * │   └── 4.png (evolution 3)
 * └── WaterSpirit/
 *     ├── 1.png
 *     ├── 2.png
 *     ├── 3.png
 *     └── 4.png
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;
const FLOW_PRIVATE_KEY = process.env.FLOW_PRIVATE_KEY;
const HUNGANZ_CONTRACT_ADDRESS = process.env.HUNGANZ_CONTRACT_ADDRESS;
const NETWORK = process.env.NETWORK || 'flowTestnet';

// Network configurations
const NETWORKS = {
  flowTestnet: {
    rpc: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545
  },
  flowMainnet: {
    rpc: 'https://mainnet.evm.nodes.onflow.org',
    chainId: 747
  },
  hardhat: {
    rpc: 'http://localhost:8545',
    chainId: 31337
  }
};

// HunganzV1 Contract ABI (minimal for addType function)
const HUNGANZ_ABI = [
  "function addType(string memory name_, uint256 rarity_, uint256 element_, string[] memory uri_) public",
  "function owner() public view returns (address)",
  "function _hungaTypeCount() public view returns (uint256)"
];

class IPFSUploader {
  constructor() {
    // Setup Pinata authentication (supports both JWT and API key methods)
    const pinataHeaders = {};
    
    if (PINATA_JWT) {
      // Modern JWT authentication (recommended)
      pinataHeaders['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      // Legacy API key + secret authentication
      pinataHeaders['pinata_api_key'] = PINATA_API_KEY;
      pinataHeaders['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    } else if (PINATA_API_KEY) {
      // API key only (may work for some endpoints)
      pinataHeaders['pinata_api_key'] = PINATA_API_KEY;
    } else {
      throw new Error('No Pinata authentication credentials found. Please set PINATA_JWT or PINATA_API_KEY in your .env file.');
    }

    this.pinataAxios = axios.create({
      baseURL: 'https://api.pinata.cloud',
      headers: pinataHeaders
    });

    // Setup ethers provider and wallet
    const networkConfig = NETWORKS[NETWORK];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${NETWORK}`);
    }

    this.provider = new ethers.JsonRpcProvider(networkConfig.rpc);
    this.wallet = new ethers.Wallet(FLOW_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(HUNGANZ_CONTRACT_ADDRESS, HUNGANZ_ABI, this.wallet);
  }

  /**
   * Validate environment variables
   */
  validateConfig() {
    const required = ['FLOW_PRIVATE_KEY', 'HUNGANZ_CONTRACT_ADDRESS'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate Pinata authentication
    if (!PINATA_JWT && !PINATA_API_KEY) {
      throw new Error('Missing Pinata authentication. Please set either PINATA_JWT or PINATA_API_KEY in your .env file.');
    }

    console.log('✅ Configuration validated');
    console.log(`📡 Network: ${NETWORK}`);
    console.log(`📄 Contract: ${HUNGANZ_CONTRACT_ADDRESS}`);
    console.log(`👤 Wallet: ${this.wallet.address}`);
    
    // Show authentication method being used
    if (PINATA_JWT) {
      console.log('🔑 Using Pinata JWT authentication (recommended)');
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      console.log('🔑 Using Pinata API Key + Secret authentication');
    } else if (PINATA_API_KEY) {
      console.log('🔑 Using Pinata API Key only (may have limited functionality)');
    }
  }

  /**
   * Scan images directory and organize by character
   */
  scanImagesDirectory() {
    const imagesDir = path.join(__dirname, '..', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      throw new Error(`Images directory not found: ${imagesDir}`);
    }

    const characters = {};
    const characterDirs = fs.readdirSync(imagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Found ${characterDirs.length} character directories`);

    for (const characterName of characterDirs) {
      const characterDir = path.join(imagesDir, characterName);
      const evolutionImages = [];

      // Look for evolution images (1.png, 2.png, 3.png, 4.png)
      for (let evolution = 1; evolution <= 4; evolution++) {
        const imagePath = path.join(characterDir, `${evolution}.png`);
        const jpgPath = path.join(characterDir, `${evolution}.jpg`);
        const jpegPath = path.join(characterDir, `${evolution}.jpeg`);

        let foundPath = null;
        if (fs.existsSync(imagePath)) foundPath = imagePath;
        else if (fs.existsSync(jpgPath)) foundPath = jpgPath;
        else if (fs.existsSync(jpegPath)) foundPath = jpegPath;

        if (foundPath) {
          evolutionImages.push({
            evolution: evolution - 1, // Contract uses 0-based indexing
            path: foundPath,
            filename: path.basename(foundPath)
          });
        } else {
          console.warn(`⚠️  Missing evolution ${evolution} for ${characterName}`);
        }
      }

      if (evolutionImages.length > 0) {
        characters[characterName] = evolutionImages;
        console.log(`✅ ${characterName}: ${evolutionImages.length} evolution images found`);
      }
    }

    return characters;
  }

  /**
   * Upload a single image to IPFS via Pinata
   */
  async uploadImageToIPFS(imagePath, characterName, evolution) {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(imagePath);
      const filename = `${characterName}_evolution_${evolution}${path.extname(imagePath)}`;
      
      formData.append('file', fileStream, filename);
      
      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          character: characterName,
          evolution: evolution.toString(),
          type: 'character_image'
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', options);

      console.log(`📤 Uploading ${filename} to IPFS...`);
      
      const response = await this.pinataAxios.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `ipfs://${ipfsHash}`;
      
      console.log(`✅ Uploaded: ${ipfsUrl}`);
      return ipfsUrl;

    } catch (error) {
      console.error(`❌ Failed to upload ${imagePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Upload all evolution images for a character
   */
  async uploadCharacterImages(characterName, evolutionImages) {
    console.log(`\n🦄 Processing ${characterName}...`);
    
    const uris = new Array(5).fill(''); // 5 evolution stages (0-4)
    
    for (const image of evolutionImages) {
      const ipfsUrl = await this.uploadImageToIPFS(
        image.path, 
        characterName, 
        image.evolution
      );
      uris[image.evolution] = ipfsUrl;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return uris;
  }

  /**
   * Add character type to the contract
   */
  async addCharacterType(characterName, rarity, element, uris) {
    try {
      console.log(`📝 Adding ${characterName} to contract...`);
      console.log(`   Rarity: ${rarity}, Element: ${element}`);
      console.log(`   URIs: ${uris.filter(uri => uri).length}/5 provided`);

      const tx = await this.contract.addType(
        characterName,
        rarity,
        element,
        uris
      );

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      
      console.log(`✅ Character type added! Gas used: ${receipt.gasUsed.toString()}`);
      return receipt;

    } catch (error) {
      console.error(`❌ Failed to add character type:`, error.message);
      throw error;
    }
  }

  /**
   * Interactive prompt for character attributes
   */
  async promptCharacterAttributes(characterName) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    console.log(`\n🎨 Configure attributes for ${characterName}:`);
    console.log('Rarity: 0=Common, 1=Rare, 2=Epic, 3=Legendary');
    console.log('Element: 0=Fire, 1=Water, 2=Plant, 3=Air');

    const rarity = parseInt(await question(`Enter rarity (0-3): `));
    const element = parseInt(await question(`Enter element (0-3): `));

    rl.close();

    if (isNaN(rarity) || rarity < 0 || rarity > 3) {
      throw new Error('Invalid rarity. Must be 0-3.');
    }
    if (isNaN(element) || element < 0 || element > 3) {
      throw new Error('Invalid element. Must be 0-3.');
    }

    return { rarity, element };
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Starting Hunganz IPFS Uploader...\n');
      
      // Validate configuration
      this.validateConfig();
      
      // Scan images directory
      const characters = this.scanImagesDirectory();
      
      if (Object.keys(characters).length === 0) {
        throw new Error('No character directories found in images/');
      }

      // Process each character
      for (const [characterName, evolutionImages] of Object.entries(characters)) {
        try {
          // Upload images to IPFS
          const uris = await this.uploadCharacterImages(characterName, evolutionImages);
          
          // Get character attributes
          const { rarity, element } = await this.promptCharacterAttributes(characterName);
          
          // Add to contract
          await this.addCharacterType(characterName, rarity, element, uris);
          
          console.log(`✅ ${characterName} completed successfully!\n`);
          
        } catch (error) {
          console.error(`❌ Failed to process ${characterName}:`, error.message);
          console.log('Continuing with next character...\n');
        }
      }

      console.log('🎉 All characters processed!');
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the uploader if called directly
if (require.main === module) {
  const uploader = new IPFSUploader();
  uploader.run();
}

module.exports = IPFSUploader;
