# 🖼️ Hunganz Character Images Directory

This directory contains the evolution images for Hunganz NFT characters. Each character should have its own subdirectory with numbered evolution images.

## 📁 Directory Structure

```
images/
├── CharacterName1/
│   ├── 1.png    # Evolution 0 (base form)
│   ├── 2.png    # Evolution 1
│   ├── 3.png    # Evolution 2
│   └── 4.png    # Evolution 3 (final form)
├── CharacterName2/
│   ├── 1.jpg    # Supports .png, .jpg, .jpeg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── 4.jpg
└── ...
```

## 🎨 Image Requirements

- **Format**: PNG, JPG, or JPEG
- **Naming**: Use numbers 1-4 for evolution stages (1 = evolution 0, 4 = evolution 3)
- **Resolution**: Recommended 512x512 or higher
- **Quality**: High quality for best NFT presentation

## 🦄 Character Examples

### Sample Characters (create these directories):

- **FireDragon/** - Legendary Fire type
- **WaterSpirit/** - Epic Water type  
- **PlantGuardian/** - Epic Plant type
- **AirElemental/** - Rare Air type
- **FlameBeast/** - Rare Fire type
- **IceWolf/** - Rare Water type
- **ForestSprite/** - Common Plant type
- **WindRider/** - Common Air type
- **EmberCat/** - Common Fire type
- **StreamFish/** - Common Water type

## 🚀 Usage

1. **Add your images** to the appropriate character directories
2. **Configure environment** variables in `.env`:
   ```bash
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_key
   HUNGANZ_CONTRACT_ADDRESS=your_deployed_contract_address
   NETWORK=flowTestnet
   ```
3. **Run the uploader**:
   ```bash
   # Interactive upload (prompts for each character)
   node utils/ipfs-uploader.js
   
   # Batch upload (uses predefined configs)
   node utils/batch-upload.js
   ```

## 📋 Character Attributes

When uploading, you'll need to specify:

- **Rarity**: 0=Common, 1=Rare, 2=Epic, 3=Legendary
- **Element**: 0=Fire, 1=Water, 2=Plant, 3=Air

The batch uploader has predefined configurations for common character names.

## 🔧 Troubleshooting

- **Missing images**: The uploader will warn about missing evolution stages
- **Upload failures**: Check your Pinata API credentials
- **Contract errors**: Ensure you're the contract owner and have sufficient gas
- **Network issues**: Verify your Flow network connection

## 📝 Notes

- Images are uploaded to IPFS via Pinata for permanent storage
- IPFS URIs are automatically added to the HunganzV1 contract
- Each character type is added with all evolution URIs at once
- The process is atomic - if one evolution fails, the whole character is skipped
