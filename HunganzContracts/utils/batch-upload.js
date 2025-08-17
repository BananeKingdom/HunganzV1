#!/usr/bin/env node

/**
 * Batch IPFS Upload Utility for Hunganz Characters
 * 
 * This utility allows batch processing with predefined character configurations
 * to avoid manual input for each character during upload.
 */

const IPFSUploader = require('./ipfs-uploader');

// Predefined character configurations
// All characters set to rarity 0 (Common) as requested
const CHARACTER_CONFIGS = {
  'FireBob': { rarity: 0, element: 0 }, // Common Fire
  'WaterNolan': { rarity: 0, element: 1 }, // Common Water
  'PlantJimmy': { rarity: 0, element: 2 }, // Common Plant
};

class BatchUploader extends IPFSUploader {
  constructor() {
    super();
  }

  /**
   * Get character attributes from predefined config or prompt user
   */
  async getCharacterAttributes(characterName) {
    if (CHARACTER_CONFIGS[characterName]) {
      const config = CHARACTER_CONFIGS[characterName];
      console.log(`📋 Using predefined config for ${characterName}:`);
      console.log(`   Rarity: ${config.rarity} (${this.getRarityName(config.rarity)})`);
      console.log(`   Element: ${config.element} (${this.getElementName(config.element)})`);
      return config;
    }

    console.log(`⚠️  No predefined config for ${characterName}, prompting for input...`);
    return await this.promptCharacterAttributes(characterName);
  }

  /**
   * Get rarity name for display
   */
  getRarityName(rarity) {
    const names = ['Common', 'Rare', 'Epic', 'Legendary'];
    return names[rarity] || 'Unknown';
  }

  /**
   * Get element name for display
   */
  getElementName(element) {
    const names = ['Fire', 'Water', 'Plant', 'Air'];
    return names[element] || 'Unknown';
  }

  /**
   * Run batch upload with predefined configurations
   */
  async runBatch() {
    try {
      console.log('🚀 Starting Hunganz Batch IPFS Uploader...\n');
      
      // Validate configuration
      this.validateConfig();
      
      // Scan images directory
      const characters = this.scanImagesDirectory();
      
      if (Object.keys(characters).length === 0) {
        throw new Error('No character directories found in images/');
      }

      console.log('\n📋 Character configurations:');
      for (const characterName of Object.keys(characters)) {
        if (CHARACTER_CONFIGS[characterName]) {
          const config = CHARACTER_CONFIGS[characterName];
          console.log(`   ${characterName}: ${this.getRarityName(config.rarity)} ${this.getElementName(config.element)}`);
        } else {
          console.log(`   ${characterName}: ⚠️  Will prompt for configuration`);
        }
      }

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (query) => new Promise(resolve => rl.question(query, resolve));
      const proceed = await question('\n🤔 Proceed with batch upload? (y/N): ');
      rl.close();

      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('❌ Upload cancelled by user');
        return;
      }

      // Process each character
      let successCount = 0;
      let failCount = 0;

      for (const [characterName, evolutionImages] of Object.entries(characters)) {
        try {
          console.log(`\n${'='.repeat(50)}`);
          console.log(`🦄 Processing ${characterName} (${successCount + failCount + 1}/${Object.keys(characters).length})`);
          console.log(`${'='.repeat(50)}`);

          // Upload images to IPFS
          const uris = await this.uploadCharacterImages(characterName, evolutionImages);
          
          // Get character attributes (predefined or prompt)
          const { rarity, element } = await this.getCharacterAttributes(characterName);
          
          // Add to contract
          await this.addCharacterType(characterName, rarity, element, uris);
          
          console.log(`✅ ${characterName} completed successfully!`);
          successCount++;
          
        } catch (error) {
          console.error(`❌ Failed to process ${characterName}:`, error.message);
          failCount++;
        }
      }

      console.log(`\n${'='.repeat(50)}`);
      console.log('📊 BATCH UPLOAD SUMMARY');
      console.log(`${'='.repeat(50)}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);
      console.log(`📊 Total: ${successCount + failCount}`);
      
      if (successCount > 0) {
        console.log('\n🎉 Batch upload completed with some successes!');
      } else {
        console.log('\n💥 Batch upload failed for all characters');
      }
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the batch uploader if called directly
if (require.main === module) {
  const uploader = new BatchUploader();
  uploader.runBatch();
}

module.exports = BatchUploader;
