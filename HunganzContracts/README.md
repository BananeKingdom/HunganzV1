# 🎮 Hunganz Gaming NFT Ecosystem

**Hunganz** is a comprehensive gaming NFT ecosystem built on Flow blockchain, featuring ERC721 NFT characters with dynamic gameplay mechanics, pack opening systems, and token-based rewards.

## 🌟 Project Overview

Hunganz combines the excitement of collectible NFTs with engaging gameplay mechanics:

- **🦄 Dynamic NFT Characters**: Each Hunga has unique traits, levels, evolution stages, and elemental types
- **📦 Pack Opening System**: Randomized pack opening with commit-reveal mechanics for fairness
- **🎯 Fetch Quest System**: Send your Hungas on adventures to earn rewards and experience
- **🪙 Token Economy**: BananeV1 (ERC20) tokens as in-game currency and rewards
- **🔀 Evolution & Progression**: Characters can level up, evolve, and unlock new abilities
- **🎲 Verifiable Randomness**: Uses Flow's native randomness beacon for secure, unpredictable outcomes

## 🏗️ Architecture

### Core Contracts

1. **HunganzV1.sol** - Main NFT contract implementing ERC721
   - Character minting, evolution, and management
   - Pack opening with commit-reveal randomness
   - Fetch quest system with rewards
   - Transfer restrictions during active quests

2. **BananeV1.sol** - ERC20 token contract
   - In-game currency and reward system
   - Controlled minting/burning by authorized contracts
   - Supply management with maximum cap

3. **FlowCommitRevealLib.sol** - Randomness library
   - Commit-reveal pattern implementation
   - Integration with Flow's randomness beacon
   - Secure random number generation

4. **MockFlowRandomness.sol** - Testing utility
   - Mock randomness provider for local development
   - Simulates Flow's randomness beacon behavior

### Key Features

#### 🎮 Gaming Mechanics
- **Character Types**: Fire, Water, Plant, Air elements with different rarities
- **Level System**: Characters gain experience and level up (max level 100)
- **Evolution Stages**: 5 evolution stages with unique artwork and abilities
- **Fetch Quests**: Send characters on timed adventures for rewards
- **Pack Types**: Different pack rarities with varying character type ranges

#### 🔒 Security Features
- **Commit-Reveal Randomness**: Prevents manipulation of random outcomes
- **Transfer Restrictions**: Characters cannot be transferred during active quests
- **Access Controls**: Owner-only functions for critical operations
- **Supply Limits**: Maximum token supply enforcement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (22.10.0+ recommended for Hardhat 3)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd HunganzContracts

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Flow private key
# FLOW_PRIVATE_KEY=your_private_key_without_0x_prefix
```

### Environment Setup

1. **Get a Flow Private Key**:
   - Create a Flow wallet or generate a new key
   - Export your private key (remove `0x` prefix)
   - Add it to your `.env` file

2. **Fund Your Account**:
   - **Testnet**: Use [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
   - **Mainnet**: Transfer FLOW tokens to your address

## 🧪 Testing

### Run All Tests

```bash
# Run complete test suite (42 tests)
npx hardhat test
```

### Run Specific Test Suites

```bash
# Test HunganzV1 contract (11 tests)
npx hardhat test test/HunganzV1.t.sol

# Test BananeV1 contract (21 tests)
npx hardhat test test/BananeV1.t.sol

# Test FlowCommitRevealLib (10 tests)
npx hardhat test test/FlowCommitRevealLib.t.sol
```

### Test Coverage

- **HunganzV1**: Character creation, pack opening, fetch quests, evolution
- **BananeV1**: Token minting, burning, access controls, supply management
- **FlowCommitRevealLib**: Commit-reveal cycles, randomness generation

## 🚀 Deployment

### Local Development

```bash
# Deploy to local Hardhat network (uses mock randomness)
npx hardhat ignition deploy ignition/modules/HunganzEcosystem.ts
```

### Flow Testnet

```bash
# Deploy to Flow EVM Testnet
npx hardhat ignition deploy ignition/modules/HunganzEcosystem.ts --network flowTestnet
```

### Flow Mainnet

```bash
# Deploy to Flow EVM Mainnet
npx hardhat ignition deploy ignition/modules/HunganzEcosystem.ts --network flowMainnet
```

### Deployment Configuration

The unified deployment script (`HunganzEcosystem.ts`) handles:
- BananeV1 token deployment with 1M initial supply
- HunganzV1 NFT contract with Flow randomness beacon integration
- Automatic authorization setup between contracts

## 🌐 Network Configuration

### Flow EVM Networks

| Network | Chain ID | RPC URL | Faucet |
|---------|----------|---------|--------|
| Flow Testnet | 545 | `https://testnet.evm.nodes.onflow.org` | [Testnet Faucet](https://testnet-faucet.onflow.org/) |
| Flow Mainnet | 747 | `https://mainnet.evm.nodes.onflow.org` | - |

### Randomness Beacon

- **Address**: `0x0000000000000000000000010000000000000001`
- **Type**: Flow EVM precompiled contract
- **Purpose**: Provides secure, verifiable randomness for gaming mechanics

## 🎯 Usage Examples

### Adding Character Types (Owner Only)

```solidity
// Add a new character type
hunganzContract.addType(
    "Lightning Dragon",     // name
    2,                      // rarity (0=common, 1=rare, 2=epic, 3=legendary)
    3,                      // element (0=fire, 1=water, 2=plant, 3=air)
    ["ipfs://evo0", "ipfs://evo1", "ipfs://evo2", "ipfs://evo3", "ipfs://evo4"]
);
```

### Opening Packs

```solidity
// 1. Acquire a pack (commit phase)
hunganzContract.aquirePack(packTypeId);

// 2. Wait for next block, then open (reveal phase)
hunganzContract.openPack();
```

### Fetch Quests

```solidity
// Send character on fetch quest
hunganzContract.sendFetch(tokenId);

// Reveal quest results (after commitment period)
hunganzContract.revealFetch(tokenId);
```

## 📁 Project Structure

```
HunganzContracts/
├── contracts/
│   ├── HunganzV1.sol              # Main NFT contract
│   ├── BananeV1.sol               # ERC20 token contract
│   ├── FlowCommitRevealLib.sol    # Randomness library
│   └── test/
│       └── MockFlowRandomness.sol # Mock for testing
├── test/
│   ├── HunganzV1.t.sol           # NFT contract tests
│   ├── BananeV1.t.sol            # Token contract tests
│   └── FlowCommitRevealLib.t.sol # Library tests
├── ignition/
│   └── modules/
│       └── HunganzEcosystem.ts   # Unified deployment script
├── .env.example                  # Environment template
├── .env                         # Your environment variables
├── hardhat.config.ts           # Hardhat configuration
└── package.json                # Dependencies
```

## 🔧 Development

### Compile Contracts

```bash
npx hardhat compile
```

### Clean Build Artifacts

```bash
npx hardhat clean
```

### Verify Contracts (after deployment)

```bash
# Verify on Flow block explorer
npx hardhat verify --network flowTestnet <contract-address> <constructor-args>
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Stack too deep" compilation error**:
   - Already resolved by optimizing contract functions
   - Uses `viaIR: true` in compiler settings

2. **Test failures after contract changes**:
   - Run `npx hardhat clean` and recompile
   - Check that all tests use `getHungaInfo()` instead of removed `getHunga()`

3. **Deployment failures**:
   - Ensure your account has sufficient FLOW tokens
   - Check that `FLOW_PRIVATE_KEY` is set correctly in `.env`
   - Verify network connectivity

### Gas Optimization

- Compiler optimization enabled with 200 runs
- `viaIR` compilation for complex contracts
- Struct-based return values to reduce stack depth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npx hardhat test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Flow Developer Portal](https://developers.flow.com/)
- [Flow EVM Documentation](https://developers.flow.com/evm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**Built with ❤️ for the Flow ecosystem**
