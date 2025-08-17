// Contract addresses and configuration
export const CONTRACTS = {
  // Flow Mainnet
  FLOW_MAINNET: {
    chainId: 747,
    name: 'Flow Mainnet',
    rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
    blockExplorer: 'https://evm.flowscan.org',
    contracts: {
      BANANE_V1: '0x4064f2816a55aF45e8E2C777a36d5710AC46b907',
      HUNGANZ_V1: '0x56B89B4e4e586289c0286e9Cfd622E6deDb55334',
      FLOW_RANDOMNESS: '0x0000000000000000000000010000000000000001',
    }
  },
  // Flow Testnet
  FLOW_TESTNET: {
    chainId: 545,
    name: 'Flow Testnet',
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    blockExplorer: 'https://evm-testnet.flowscan.org',
    contracts: {
      BANANE_V1: '0x0000000000000000000000000000000000000000', // Add testnet address if available
      HUNGANZ_V1: '0x0000000000000000000000000000000000000000', // Add testnet address if available
      FLOW_RANDOMNESS: '0x0000000000000000000000010000000000000001',
    }
  },
  // Local/Hardhat
  LOCAL: {
    chainId: 31337,
    name: 'Hardhat Network',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    contracts: {
      BANANE_V1: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      HUNGANZ_V1: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      FLOW_RANDOMNESS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // MockFlowRandomness
    }
  }
};

// Get contract addresses for current network
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 747:
      return CONTRACTS.FLOW_MAINNET.contracts;
    case 545:
      return CONTRACTS.FLOW_TESTNET.contracts;
    case 31337:
    case 1337:
      return CONTRACTS.LOCAL.contracts;
    default:
      return CONTRACTS.FLOW_MAINNET.contracts; // Default to mainnet
  }
}

// Get network config
export function getNetworkConfig(chainId: number) {
  switch (chainId) {
    case 747:
      return CONTRACTS.FLOW_MAINNET;
    case 545:
      return CONTRACTS.FLOW_TESTNET;
    case 31337:
    case 1337:
      return CONTRACTS.LOCAL;
    default:
      return CONTRACTS.FLOW_MAINNET;
  }
}

// Contract ABIs
export const BANANE_V1_ABI = [
  // ERC20 Standard functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Custom Banane functions
  'function mint(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function burnFrom(address from, uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const HUNGANZ_V1_ABI = [
  // ERC721 Standard functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  
  // ERC721Enumerable functions
  'function totalSupply() view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  
  // Custom Hunganz functions
  'function getHungaInfo(uint256 tokenId) view returns (tuple(address owner, uint256 id, uint256 typeId, uint256 typeIndex, uint256 level, uint256 experience, uint256 evolution, uint256 rarity, uint256 element, uint256 fetchCount, bool isFetching, uint256 nextHarvestAmount, string name, string uri, bool isDead))',
  'function getHungaBasicInfo(uint256 tokenId) view returns (address owner, uint256 id, uint256 typeId, uint256 typeIndex)',
  'function getHungaLevelInfo(uint256 tokenId) view returns (uint256 level, uint256 experience, uint256 evolution, bool isDead)',
  'function getHungaTypeInfo(uint256 tokenId) view returns (uint256 rarity, uint256 element, string name, string uri)',
  'function getHungaFetchInfo(uint256 tokenId) view returns (uint256 fetchCount, bool isFetching, uint256 nextHarvestAmount)',
  'function addPackType(uint256 fromTypeIndex, uint256 toTypeIndex)',
  'function aquirePack(uint256 packTypeId)',
  'function openPack()',
  'function sendFetch(uint256 tokenId)',
  'function revealFetch(uint256 tokenId)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event HungaMinted(address indexed user, uint256 tokenId, uint256 typeId, uint256 typeIndex)',
  'event PackAquired(address indexed user, uint256 packTypeId, uint64 commitRound)',
  'event PackOpened(address indexed user, uint256 packTypeId, uint64 commitRound)',
  'event SentFetching(uint256 tokenId, uint64 commitRound)',
  'event RevealedFetching(uint256 tokenId)',
  'event LevelUp(uint256 tokenId, uint256 level)',
  'event EvolutionUp(uint256 tokenId, uint256 evolution)',
  'event ExperienceUp(uint256 tokenId, uint256 experience)',
  'event RIP(uint256 tokenId)',
  'event TypeAdded(uint256 id, string name, uint256 rarity, uint256 element, string[] uri)',
];

export const FLOW_RANDOMNESS_ABI = [
  'function getRandomSource() view returns (uint64)',
  'function getRandomInRange(uint64 min, uint64 max) view returns (uint64)',
];
