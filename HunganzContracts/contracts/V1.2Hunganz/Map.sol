// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IBanane} from "./Banana.sol";
import {IHunganz} from "./Hunganz.sol";
import {CadenceRandomConsumer} from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Map Contract
 * @dev Game contract for Hunganz climbing and resource fetching mechanics
 * Features commit-reveal scheme for fair gameplay
 */
contract Map is CadenceRandomConsumer, Ownable {
    IBanane public bananeContract;
    mapping(address => bool) public hunganzContract;
    
    // Game state
    mapping(address => Team) public teams;
    mapping(bytes32 => CommitData) public commits;
    mapping(address => uint256) public playerNonce;
    
    // Game parameters
    uint256 public constant CLIMB_BASE_REWARD = 10 * 10**18; // 10 BANANE
    uint256 public constant FETCH_BASE_REWARD = 5 * 10**18;  // 5 BANANE
    uint256 public constant BASE_XP_REWARD = 100;
    uint256 public constant COMMIT_REVEAL_WINDOW = 300; // 5 minutes
    uint256 public constant MAX_TEAM_SIZE = 5;
    uint256 public constant CLIMB_DIFFICULTY = 1000; // Base difficulty out of 10000
    
    struct Hunga {
        address contractAddress;
        uint256 id;
        uint256 height;
        bool isActive;
    }

    struct Team {
        address player;
        string name;
        Hunga[] hungas;
        uint256 totalHeight;
        uint256 totalClimbs;
        uint256 totalFetches;
        bool isActive;
    }
    
    struct CommitData {
        address player;
        uint256 hungaId;
        uint256 timestamp;
        ActionType actionType;
        bool revealed;
    }
    
    enum ActionType {
        CLIMB,
        FETCH
    }
    
    // Events
    event TeamCreated(address indexed player, string teamName);
    event HungaAddedToTeam(address indexed player, address contractAddress, uint256 hungaId);
    event ActionCommitted(address indexed player, bytes32 commitHash, ActionType actionType);
    event ClimbAttempted(address indexed player, uint256 hungaId, bool success, uint256 heightGained, uint256 reward);
    event FetchAttempted(address indexed player, uint256 hungaId, bool success, uint256 reward);
    event ContractAdded(address indexed contractAddress);
    
    constructor(address _bananeContract) Ownable(msg.sender) {
        bananeContract = IBanane(_bananeContract);
    }
    
    /**
     * @dev Add a Hunganz contract address that can be used in teams
     */
    function addHunganzContract(address contract_) external onlyOwner {
        hunganzContract[contract_] = true;
        emit ContractAdded(contract_);
    }
    
    /**
     * @dev Create a new team
     */
    function createTeam(string memory teamName_) external {
        require(!teams[msg.sender].isActive, "Team already exists");
        require(bytes(teamName_).length > 0, "Team name cannot be empty");
        
        teams[msg.sender].player = msg.sender;
        teams[msg.sender].name = teamName_;
        teams[msg.sender].totalHeight = 0;
        teams[msg.sender].totalClimbs = 0;
        teams[msg.sender].totalFetches = 0;
        teams[msg.sender].isActive = true;
        
        emit TeamCreated(msg.sender, teamName_);
    }
    
    /**
     * @dev Add a Hunga to the player's team
     */
    function addHungaToTeam(address contract_, uint256 id_) external {
        require(hunganzContract[contract_], "Invalid Hunganz contract");
        require(teams[msg.sender].isActive, "No active team");
        require(teams[msg.sender].hungas.length < MAX_TEAM_SIZE, "Team is full");
        
        // Verify ownership
        IHunganz hunganzNFT = IHunganz(contract_);
        (address owner,,,,,,,,,,,,, ) = hunganzNFT.getHunga(id_);
        require(owner == msg.sender, "Not the owner of this Hunga");
        
        // Check if Hunga is already in team
        for (uint256 i = 0; i < teams[msg.sender].hungas.length; i++) {
            require(!(teams[msg.sender].hungas[i].contractAddress == contract_ && 
                     teams[msg.sender].hungas[i].id == id_), "Hunga already in team");
        }
        
        teams[msg.sender].hungas.push(Hunga(contract_, id_, 0, true));
        emit HungaAddedToTeam(msg.sender, contract_, id_);
    }
    
    /**
     * @dev Commit to a climb action
     */
    function climbCommit(uint256 hungaId_, uint256 nonce_) external {
        require(teams[msg.sender].isActive, "No active team");
        require(_isHungaInTeam(msg.sender, hungaId_), "Hunga not in team");
        
        bytes32 commitHash = keccak256(abi.encodePacked(msg.sender, hungaId_, nonce_, ActionType.CLIMB, block.timestamp));
        
        commits[commitHash] = CommitData({
            player: msg.sender,
            hungaId: hungaId_,
            timestamp: block.timestamp,
            actionType: ActionType.CLIMB,
            revealed: false
        });
        
        playerNonce[msg.sender] = nonce_;
        emit ActionCommitted(msg.sender, commitHash, ActionType.CLIMB);
    }
    
    /**
     * @dev Reveal and execute climb action
     */
    function climbReveal(bytes32 commitHash_) external {
        CommitData storage commit = commits[commitHash_];
        require(commit.player == msg.sender, "Not your commit");
        require(!commit.revealed, "Already revealed");
        require(block.timestamp <= commit.timestamp + COMMIT_REVEAL_WINDOW, "Reveal window expired");
        require(commit.actionType == ActionType.CLIMB, "Not a climb commit");
        
        commit.revealed = true;
        
        // Get Hunga stats for climb calculation
        IHunganz hunganzNFT = IHunganz(_getHungaContract(msg.sender, commit.hungaId));
        (,,,,,uint256 level,, uint256 evolution, uint256 health, uint256 trauma,,,, ) = hunganzNFT.getHunga(commit.hungaId);
        
        // Calculate success probability based on Hunga stats
        uint256 successChance = _calculateClimbSuccess(level, evolution, health, trauma);
        uint256 randomValue = _getRevertibleRandomInRange(0, 10000);
        
        bool success = randomValue < successChance;
        uint256 heightGained = 0;
        uint256 reward = 0;
        
        if (success) {
            heightGained = _calculateHeightGain(level, evolution);
            reward = CLIMB_BASE_REWARD + (heightGained * 10**18) / 100; // Bonus based on height
            
            // Update team stats
            _updateHungaHeight(msg.sender, commit.hungaId, heightGained);
            teams[msg.sender].totalHeight += heightGained;
            teams[msg.sender].totalClimbs += 1;
            
            // Reward player
            bananeContract.mint(msg.sender, reward);
            hunganzNFT.xpUp(commit.hungaId, BASE_XP_REWARD);
        } else {
            // Failed climb causes damage and trauma
            uint256 damage = _calculateClimbDamage(level);
            hunganzNFT.damage(commit.hungaId, damage);
            hunganzNFT.traumaUp(commit.hungaId, 1);
        }
        
        emit ClimbAttempted(msg.sender, commit.hungaId, success, heightGained, reward);
    }
    
    /**
     * @dev Commit to a fetch action
     */
    function fetchCommit(uint256 hungaId_, uint256 nonce_) external {
        require(teams[msg.sender].isActive, "No active team");
        require(_isHungaInTeam(msg.sender, hungaId_), "Hunga not in team");
        
        bytes32 commitHash = keccak256(abi.encodePacked(msg.sender, hungaId_, nonce_, ActionType.FETCH, block.timestamp));
        
        commits[commitHash] = CommitData({
            player: msg.sender,
            hungaId: hungaId_,
            timestamp: block.timestamp,
            actionType: ActionType.FETCH,
            revealed: false
        });
        
        playerNonce[msg.sender] = nonce_;
        emit ActionCommitted(msg.sender, commitHash, ActionType.FETCH);
    }
    
    /**
     * @dev Reveal and execute fetch action
     */
    function fetchReveal(bytes32 commitHash_) external {
        CommitData storage commit = commits[commitHash_];
        require(commit.player == msg.sender, "Not your commit");
        require(!commit.revealed, "Already revealed");
        require(block.timestamp <= commit.timestamp + COMMIT_REVEAL_WINDOW, "Reveal window expired");
        require(commit.actionType == ActionType.FETCH, "Not a fetch commit");
        
        commit.revealed = true;
        
        // Get Hunga stats for fetch calculation
        IHunganz hunganzNFT = IHunganz(_getHungaContract(msg.sender, commit.hungaId));
        (,,,,,uint256 level,, uint256 evolution, uint256 health,,,,, ) = hunganzNFT.getHunga(commit.hungaId);
        
        // Calculate success probability (easier than climbing)
        uint256 successChance = _calculateFetchSuccess(level, evolution, health);
        uint256 randomValue = _getRevertibleRandomInRange(0, 10000);
        
        bool success = randomValue < successChance;
        uint256 reward = 0;
        
        if (success) {
            reward = FETCH_BASE_REWARD + (level * 10**18) / 10; // Level-based bonus
            teams[msg.sender].totalFetches += 1;
            
            // Reward player
            bananeContract.mint(msg.sender, reward);
            hunganzNFT.xpUp(commit.hungaId, BASE_XP_REWARD / 2); // Less XP than climbing
        }
        
        emit FetchAttempted(msg.sender, commit.hungaId, success, reward);
    }
    
    // Internal helper functions
    function _isHungaInTeam(address player_, uint256 hungaId_) internal view returns (bool) {
        Team storage team = teams[player_];
        for (uint256 i = 0; i < team.hungas.length; i++) {
            if (team.hungas[i].id == hungaId_ && team.hungas[i].isActive) {
                return true;
            }
        }
        return false;
    }
    
    function _getHungaContract(address player_, uint256 hungaId_) internal view returns (address) {
        Team storage team = teams[player_];
        for (uint256 i = 0; i < team.hungas.length; i++) {
            if (team.hungas[i].id == hungaId_) {
                return team.hungas[i].contractAddress;
            }
        }
        revert("Hunga not found");
    }
    
    function _updateHungaHeight(address player_, uint256 hungaId_, uint256 height_) internal {
        Team storage team = teams[player_];
        for (uint256 i = 0; i < team.hungas.length; i++) {
            if (team.hungas[i].id == hungaId_) {
                team.hungas[i].height += height_;
                break;
            }
        }
    }
    
    function _calculateClimbSuccess(uint256 level_, uint256 evolution_, uint256 health_, uint256 trauma_) internal pure returns (uint256) {
        uint256 baseSuccess = 5000; // 50% base success rate
        uint256 levelBonus = level_ * 100; // +1% per level
        uint256 evolutionBonus = evolution_ * 200; // +2% per evolution
        uint256 healthPenalty = health_ < 50 ? (50 - health_) * 50 : 0; // Penalty for low health
        uint256 traumaPenalty = trauma_ * 100; // -1% per trauma point
        
        uint256 successChance = baseSuccess + levelBonus + evolutionBonus;
        if (successChance > healthPenalty + traumaPenalty) {
            successChance -= (healthPenalty + traumaPenalty);
        } else {
            successChance = 1000; // Minimum 10% success rate
        }
        
        return successChance > 9000 ? 9000 : successChance; // Cap at 90%
    }
    
    function _calculateFetchSuccess(uint256 level_, uint256 evolution_, uint256 health_) internal pure returns (uint256) {
        uint256 baseSuccess = 7000; // 70% base success rate (easier than climbing)
        uint256 levelBonus = level_ * 50; // +0.5% per level
        uint256 evolutionBonus = evolution_ * 100; // +1% per evolution
        uint256 healthPenalty = health_ < 30 ? (30 - health_) * 100 : 0; // Penalty for very low health
        
        uint256 successChance = baseSuccess + levelBonus + evolutionBonus;
        if (successChance > healthPenalty) {
            successChance -= healthPenalty;
        } else {
            successChance = 3000; // Minimum 30% success rate
        }
        
        return successChance > 9500 ? 9500 : successChance; // Cap at 95%
    }
    
    function _calculateHeightGain(uint256 level_, uint256 evolution_) internal view returns (uint256) {
        uint256 baseHeight = 10;
        uint256 randomBonus = _getRevertibleRandomInRange(1, 20);
        uint256 levelBonus = level_ / 2;
        uint256 evolutionBonus = evolution_ * 5;
        
        return baseHeight + randomBonus + levelBonus + evolutionBonus;
    }
    
    function _calculateClimbDamage(uint256 level_) internal view returns (uint256) {
        uint256 baseDamage = 10;
        uint256 randomDamage = _getRevertibleRandomInRange(5, 25);
        uint256 levelReduction = level_ / 3; // Higher level = less damage
        
        uint256 totalDamage = baseDamage + randomDamage;
        return totalDamage > levelReduction ? totalDamage - levelReduction : 5; // Minimum 5 damage
    }
    
    // View functions
    function getTeamInfo(address player_) external view returns (
        string memory name,
        uint256 totalHeight,
        uint256 totalClimbs,
        uint256 totalFetches,
        uint256 teamSize
    ) {
        Team storage team = teams[player_];
        return (
            team.name,
            team.totalHeight,
            team.totalClimbs,
            team.totalFetches,
            team.hungas.length
        );
    }
    
    function getTeamHungas(address player_) external view returns (
        address[] memory contracts,
        uint256[] memory ids,
        uint256[] memory heights,
        bool[] memory activeStatus
    ) {
        Team storage team = teams[player_];
        uint256 length = team.hungas.length;
        
        contracts = new address[](length);
        ids = new uint256[](length);
        heights = new uint256[](length);
        activeStatus = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            contracts[i] = team.hungas[i].contractAddress;
            ids[i] = team.hungas[i].id;
            heights[i] = team.hungas[i].height;
            activeStatus[i] = team.hungas[i].isActive;
        }
    }
}

// Interface for external contracts to interact with Map
interface IMap {
    function createTeam(string memory teamName) external;
    function addHungaToTeam(address contract_, uint256 id_) external;
    function climbCommit(uint256 hungaId_, uint256 nonce_) external;
    function climbReveal(bytes32 commitHash_) external;
    function fetchCommit(uint256 hungaId_, uint256 nonce_) external;
    function fetchReveal(bytes32 commitHash_) external;
    function getTeamInfo(address player_) external view returns (string memory, uint256, uint256, uint256, uint256);
}

