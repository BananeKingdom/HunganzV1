# 🛠️ Hunganz Utilities

This directory contains utility scripts for managing the Hunganz gaming NFT ecosystem, including IPFS image uploads and contract management.

## 📁 Available Utilities

### 🖼️ IPFS Image Uploader (`ipfs-uploader.js`)

Interactive utility to upload character evolution images to IPFS and automatically update the HunganzV1 contract with the URIs.

**Features:**
- Scans `images/` directory for character folders
- Uploads images to IPFS via Pinata
- Interactive prompts for character attributes (rarity, element)
- Automatically calls `addType()` on the contract
- Comprehensive error handling and progress tracking

**Usage:**
```bash
# Interactive mode
node utils/ipfs-uploader.js
# or
npm run ipfs:upload
```

### 🚀 Batch IPFS Uploader (`batch-upload.js`)

Automated batch processing with predefined character configurations to avoid manual input.

**Features:**
- Predefined character configurations for common types
- Batch processing with summary reporting
- Confirmation prompts before processing
- Detailed progress tracking for large batches

**Usage:**
```bash
# Batch mode
node utils/batch-upload.js
# or
npm run ipfs:batch
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Add the following to your `.env` file:

```bash
# Pinata IPFS credentials
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

# Contract configuration
HUNGANZ_CONTRACT_ADDRESS=your_deployed_contract_address
NETWORK=flowTestnet  # or flowMainnet

# Flow wallet (already configured)
FLOW_PRIVATE_KEY=your_flow_private_key_without_0x
```

### 2. Get Pinata API Keys

1. Visit [Pinata.cloud](https://pinata.cloud/)
2. Create a free account
3. Go to API Keys section
4. Generate new API key with pinning permissions
5. Copy API Key and Secret API Key to your `.env`

### 3. Prepare Images

Organize your character images in the `images/` directory:

```
images/
├── FireDragon/
│   ├── 1.png    # Evolution 0 (base)
│   ├── 2.png    # Evolution 1
│   ├── 3.png    # Evolution 2
│   └── 4.png    # Evolution 3 (final)
├── WaterSpirit/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── 4.jpg
└── ...
```

## 🎨 Character Configuration

### Predefined Characters (Batch Upload)

The batch uploader includes predefined configurations for:

| Character | Rarity | Element | Description |
|-----------|--------|---------|-------------|
| FireDragon | Legendary (3) | Fire (0) | Ultimate fire creature |
| WaterSpirit | Epic (2) | Water (1) | Mystical water being |
| PlantGuardian | Epic (2) | Plant (2) | Forest protector |
| AirElemental | Rare (1) | Air (3) | Wind creature |
| FlameBeast | Rare (1) | Fire (0) | Fire predator |
| IceWolf | Rare (1) | Water (1) | Frozen hunter |
| ForestSprite | Common (0) | Plant (2) | Small forest dweller |
| WindRider | Common (0) | Air (3) | Sky traveler |
| EmberCat | Common (0) | Fire (0) | Fire pet |
| StreamFish | Common (0) | Water (1) | Water creature |

### Custom Characters

For characters not in the predefined list, the uploader will prompt for:

- **Rarity**: 0=Common, 1=Rare, 2=Epic, 3=Legendary
- **Element**: 0=Fire, 1=Water, 2=Plant, 3=Air

## 🔐 Security Considerations

- **Private Keys**: Never commit your `.env` file with real private keys
- **API Keys**: Keep Pinata credentials secure
- **Contract Owner**: Only the contract owner can add new character types
- **Gas Costs**: Each character type addition costs gas on Flow

## 📊 Process Flow

```mermaid
graph TD
    A[Scan images/ directory] --> B[Upload images to IPFS]
    B --> C[Get character attributes]
    C --> D[Call contract.addType()]
    D --> E[Character added to game]
    
    B --> F[Generate IPFS URIs]
    F --> D
    
    C --> G[Interactive prompt]
    C --> H[Predefined config]
    G --> D
    H --> D
```

## 🚨 Error Handling

The utilities include comprehensive error handling for:

- **Missing images**: Warns about incomplete evolution sets
- **IPFS failures**: Retries and detailed error messages
- **Contract errors**: Gas estimation and transaction failures
- **Network issues**: Connection and timeout handling
- **Permission errors**: Contract ownership verification

## 📝 Logging and Monitoring

Both utilities provide detailed logging:

- **Progress tracking**: Current character and total progress
- **IPFS uploads**: Individual file upload status
- **Contract calls**: Transaction hashes and gas usage
- **Error details**: Specific failure reasons and suggestions

## 🔄 Workflow Examples

### Adding a New Character

1. **Create directory**: `mkdir images/NewCharacter`
2. **Add images**: Place `1.png`, `2.png`, `3.png`, `4.png` in the directory
3. **Run uploader**: `npm run ipfs:upload`
4. **Configure attributes**: Enter rarity and element when prompted
5. **Confirm transaction**: Approve the contract call
6. **Verify**: Character is now available in the game

### Batch Processing

1. **Prepare multiple characters**: Create directories with images
2. **Review configurations**: Check predefined configs in `batch-upload.js`
3. **Run batch upload**: `npm run ipfs:batch`
4. **Confirm processing**: Review the summary and confirm
5. **Monitor progress**: Watch the detailed progress for each character

## 🔧 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check your `.env` file has all required variables
   - Ensure no typos in variable names

2. **"Failed to upload to IPFS"**
   - Verify Pinata API credentials
   - Check internet connection
   - Try uploading a single small file first

3. **"Contract call failed"**
   - Ensure you're the contract owner
   - Check you have sufficient FLOW tokens for gas
   - Verify contract address is correct

4. **"Images directory not found"**
   - Create the `images/` directory in project root
   - Add character subdirectories with evolution images

### Debug Mode

Set environment variable for verbose logging:
```bash
DEBUG=true npm run ipfs:upload
```

## 🚀 Advanced Usage

### Custom Network Configuration

Add custom networks in the utilities by modifying the `NETWORKS` object:

```javascript
const NETWORKS = {
  customNetwork: {
    rpc: 'https://your-rpc-url.com',
    chainId: 12345
  }
};
```

### Batch Configuration Modification

Edit the `CHARACTER_CONFIGS` object in `batch-upload.js` to add your own character presets:

```javascript
const CHARACTER_CONFIGS = {
  'YourCharacter': { rarity: 2, element: 1 }, // Epic Water
  // ... add more
};
```

---

**For more information, see the main project README.md**
