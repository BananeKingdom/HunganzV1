# 🦍 Hunganz - Gaming NFT Ecosystem

**Hunganz** is a blockchain-based gaming NFT ecosystem built on Flow EVM, featuring evolving character NFTs with integrated token rewards and randomness-based gameplay mechanics.

## 📍 Deployed Contract Addresses

### 🌊 **Flow Mainnet** (Chain ID: 747)
| Contract | Address | Purpose |
|----------|---------|----------|
| **HunganzV1** | `0x56B89B4e4e586289c0286e9Cfd622E6deDb55334` | Main Gaming NFT Contract |
| **BananeV1** | `0x4064f2816a55aF45e8E2C777a36d5710AC46b907` | Utility Token (BNN) |
| **Flow Randomness** | `0x0000000000000000000000010000000000000001` | Native Randomness Beacon |

### 🧪 **Flow Testnet** (Chain ID: 545)
| Contract | Address | Purpose |
|----------|---------|----------|
| **HunganzV1** | `TBD` | Main Gaming NFT Contract |
| **BananeV1** | `TBD` | Utility Token (BNN) |
| **Flow Randomness** | `0x0000000000000000000000010000000000000001` | Native Randomness Beacon |

### 🏠 **Local Development** (Chain ID: 31337)
| Contract | Address | Purpose |
|----------|---------|----------|
| **HunganzV1** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Main Gaming NFT Contract |
| **BananeV1** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Utility Token (BNN) |
| **MockFlowRandomness** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Mock Randomness for Testing |

## 🎮 Project Overview

Hunganz combines NFT collectibles with gaming mechanics, allowing players to:
- **Mint unique character NFTs** with different rarities and elements
- **Evolve characters** through gameplay and experience
- **Earn BNN tokens** through fetch missions and activities
- **Experience randomness-based gameplay** using Flow's native randomness beacon
- **Trade and collect** rare character variations

## 🏗️ Architecture

The Hunganz ecosystem consists of three main smart contracts:

### 1. **HunganzV1** - Main Gaming NFT Contract
- **ERC721-compatible** NFT contract with gaming mechanics
- **Character Types**: FireBob, WaterNolan, PlantJimmy (with more planned)
- **Evolution System**: 4 evolution stages (0-3) with unique artwork
- **Experience & Leveling**: Characters gain XP and level up
- **Fetch Missions**: Send characters on randomness-based adventures
- **Pack System**: Acquire and open character packs

### 2. **BananeV1** - Utility Token Contract
- **ERC20-compatible** utility token (BNN)
- **Gaming Rewards**: Earned through fetch missions and activities
- **Minting Authority**: HunganzV1 contract can mint rewards
- **Burn Mechanics**: Tokens can be burned for various game actions

### 3. **Flow Randomness Integration**
- **Native Flow Randomness**: Uses Flow's built-in randomness beacon
- **Secure RNG**: Cryptographically secure random number generation
- **Gaming Mechanics**: Powers pack opening, fetch missions, and other random events



## 🎨 Character Types & IPFS Artwork

Each character type has 4 evolution stages with unique IPFS-hosted artwork:

### **FireBob** 🔥
- **Element**: Fire (0)
- **Rarity**: Common (0)
- **Evolution Stages**: 4 unique fire-themed artworks

### **WaterNolan** 💧
- **Element**: Water (1)
- **Rarity**: Common (0)
- **Evolution Stages**: 4 unique water-themed artworks

### **PlantJimmy** 🌱
- **Element**: Plant (2)
- **Rarity**: Common (0)
- **Evolution Stages**: 4 unique plant-themed artworks

## 🚀 Getting Started

### For Players
1. **Connect Wallet**: Use MetaMask or compatible wallet
2. **Switch to Flow Mainnet**: Chain ID 747
3. **Visit Frontend**: [Your Frontend URL]
4. **Acquire Packs**: Get character packs to start
5. **Open Packs**: Mint your first Hunganz characters
6. **Start Playing**: Send characters on fetch missions

### For Developers
1. **Clone Repository**: `git clone [your-repo]`
2. **Install Dependencies**: `npm install` in both `/HunganzContracts` and `/hunganzFront`
3. **Set Environment**: Copy `.env.example` and configure
4. **Deploy Contracts**: Use Hardhat Ignition for deployment
5. **Run Frontend**: `npm run dev` in `/hunganzFront/project`

## 🛠️ Technical Stack

### Smart Contracts
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **Hardhat Ignition**: Deployment management
- **OpenZeppelin**: Security and standards
- **Flow EVM**: Blockchain platform

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **ethers.js**: Blockchain interaction
- **IPFS**: Decentralized artwork storage

### Infrastructure
- **Pinata**: IPFS pinning service
- **Flow Networks**: Mainnet and Testnet
- **Multiple IPFS Gateways**: Reliability and performance

## 📁 Project Structure

```
Hunganz/
├── HunganzContracts/          # Smart contracts
│   ├── contracts/             # Solidity contracts
│   ├── ignition/             # Deployment scripts
│   ├── test/                 # Contract tests
│   └── utils/                # IPFS upload utilities
├── hunganzFront/             # Frontend application
│   └── project/              # Next.js app
│       ├── components/       # React components
│       ├── hooks/           # Custom hooks
│       ├── lib/             # Utilities
│       └── contexts/        # React contexts
└── README.md                # This file
```

## 🎯 Key Features

### 🎮 **Gaming Mechanics**
- **Character Evolution**: 4 stages with unique artwork
- **Experience System**: Gain XP through activities
- **Fetch Missions**: Randomness-based adventures
- **Pack Opening**: Acquire new characters
- **Token Rewards**: Earn BNN tokens

### 🔒 **Security Features**
- **Audited Contracts**: Based on OpenZeppelin standards
- **Randomness Security**: Uses Flow's native randomness
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: Secure against common attacks

### 🌐 **Decentralization**
- **IPFS Artwork**: Decentralized image storage
- **Multiple Gateways**: Redundant access to artwork
- **On-chain Metadata**: Core data stored on blockchain
- **Open Source**: Transparent and verifiable

## 🔗 Network Configuration

### Flow Mainnet
- **Chain ID**: 747
- **RPC URL**: `https://mainnet.evm.nodes.onflow.org`
- **Block Explorer**: `https://evm.flowscan.org`
- **Currency**: FLOW

### Flow Testnet
- **Chain ID**: 545
- **RPC URL**: `https://testnet.evm.nodes.onflow.org`
- **Block Explorer**: `https://evm-testnet.flowscan.org`
- **Currency**: FLOW (Testnet)

## 📊 Token Economics

### BNN Token (BananeV1)
- **Symbol**: BNN
- **Decimals**: 18
- **Initial Supply**: 1,000,000 BNN
- **Minting**: Controlled by HunganzV1 contract
- **Use Cases**: Game rewards, pack purchases, character upgrades

## 🎨 IPFS & Artwork

All character artwork is stored on IPFS for decentralization:
- **Multiple Gateways**: ipfs.io, Pinata, Cloudflare, dweb.link
- **Evolution Artwork**: Each character has 4 unique evolution images
- **Metadata**: Stored on-chain for reliability
- **Fallback System**: Automatic gateway switching for reliability

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Roadmap

- [ ] **Additional Character Types**: More elements and rarities
- [ ] **PvP Battles**: Character vs character combat
- [ ] **Breeding System**: Create new character combinations
- [ ] **Marketplace**: Built-in trading platform
- [ ] **Mobile App**: Native mobile experience
- [ ] **DAO Governance**: Community-driven development

## 📞 Support

- **Issues**: [GitHub Issues]
- **Discord**: [Your Discord]
- **Twitter**: [Your Twitter]
- **Documentation**: [Your Docs]

---

**Built with ❤️ on Flow EVM** 🌊