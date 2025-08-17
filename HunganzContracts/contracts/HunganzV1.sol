// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "./FlowCommitRevealLib.sol";
import {IBananeV1} from "./BananeV1.sol";

contract HunganzV1 is ERC721, Ownable {
    using FlowCommitRevealLib for IFlowRandomness;

    IBananeV1 public BANANE;
    IFlowRandomness public RNG;

    uint256 private _nextTokenId;
    uint256 private _nextTypeId;

    mapping(uint256 => Hunga) private _hungas;
    mapping(uint256 => HungaType) private _hungaTypes;
    mapping(uint256 => PackType) private _packTypes;
    mapping(address => PackUserData) private _packs;


    uint256 private _hungaTypeCount;
    uint256 private _hungaCount;
    
    uint256 private _hungaMaxLevel = 100;
    uint256 private _hungaMaxEvolution = 4;

    struct PackType {
        uint256 id;
        uint256 fromTypeIndex;
        uint256 toTypeIndex;
    }

    struct Pack {
        PackType packType;
        uint64 commitRound;
    }

    struct PackUserData {
        uint256 indexToOpen;
        Pack[] packs;
    }

    struct HungaType {
        uint256 id;
        string name;
        uint256 rarity;
        uint256 element;
        mapping (uint256 => string) uri;
        uint256 totalSupply;
    }

    struct Hunga {
        uint256 id;
        uint256 typeId;
        uint256 typeIndex;

        uint256 level;
        uint256 experience;
        uint256 evolution;
        uint256 nextHarvestAmount;

        uint256 fetchCount;
        bool isFetching;
        uint64 commitRound;

        bool isDead;
    }

    string[4] private _rarityNames = ["common", "rare", "epic", "legendary"];
    string[4] private _elementNames = ["fire", "water", "plant", "air"];


    event RevealedFetching(uint256 tokenId);
    event RIP(uint256 tokenId);
    event LevelUp(uint256 tokenId, uint256 level);
    event EvolutionUp(uint256 tokenId, uint256 evolution);
    event ExperienceUp(uint256 tokenId, uint256 experience);
    event SentFetching(uint256 tokenId, uint64 commitRound);
    event PackAquired(address indexed user, uint256 packTypeId, uint64 commitRound);
    event PackOpened(address indexed user, uint256 packTypeId, uint64 commitRound);
    event HungaMinted(address indexed user, uint256 tokenId, uint256 typeId, uint256 typeIndex);
    event TypeAdded(uint256 id, string name, uint256 rarity, uint256 element, string[] uri);






    constructor(address _rng, address _banane) ERC721("Hunga", "HNG") Ownable(msg.sender) {
        RNG = IFlowRandomness(_rng);
        BANANE = IBananeV1(_banane);
    }

    function addType(string memory name_, uint256 rarity_, uint256 element_, string [] memory uri_) public onlyOwner {
        if(rarity_ >= _rarityNames.length) revert("Invalid rarity");
        if(element_ >= _elementNames.length) revert("Invalid element");
        if(uri_.length != _hungaMaxEvolution) revert("Invalid URI array length");

        uint256 id = _nextTypeId;
        _nextTypeId += 1;

        _hungaTypes[id].id = id;
        _hungaTypes[id].name = name_;
        _hungaTypes[id].rarity = rarity_;
        _hungaTypes[id].element = element_;
        _hungaTypes[id].totalSupply = 0;

        for(uint256 i = 0; i < _hungaMaxEvolution; i++) _hungaTypes[id].uri[i] = uri_[i];
        
        emit TypeAdded(id, name_, rarity_, element_, uri_);
    }

    function getHunga(uint256 tokenId) public view 
            returns (address owner, 
                     uint256 id, 
                     uint256 typeId, 
                     uint256 typeIndex, 
                     uint256 level, 
                     uint256 experience, 
                     uint256 evolution, 
                     uint256 rarity, 
                     uint256 element,
                     uint256 fetchCount,
                     bool isFetching,
                     uint256 nextHarvestAmount,
                     string memory name, 
                     string memory uri,
                     bool isDead) {

        address _owner = _ownerOf(tokenId);
        uint256 _id = _hungas[tokenId].id;
        uint256 _typeId = _hungas[tokenId].typeId;
        uint256 _typeIndex = _hungas[tokenId].typeIndex;
        uint256 _level = _hungas[tokenId].level;
        uint256 _experience = _hungas[tokenId].experience;
        uint256 _evolution = _hungas[tokenId].evolution;
        uint256 _nextHarvestAmount = _hungas[tokenId].nextHarvestAmount;
        uint256 _fetchCount = _hungas[tokenId].fetchCount;
        bool _isFetching = _hungas[tokenId].isFetching;
        uint256 _rarity = _hungaTypes[_typeId].rarity;
        uint256 _element = _hungaTypes[_typeId].element;

        string memory _name = _hungaTypes[_typeId].name;
        string memory _uri = _hungaTypes[_typeId].uri[_evolution];

        bool _isDead = _hungas[tokenId].isDead;

        return 
           (_owner, 
            _id, 
            _typeId, 
            _typeIndex, 
            _level, 
            _experience, 
            _evolution, 
            _rarity, 
            _element, 
            _fetchCount, 
            _isFetching, 
            _nextHarvestAmount,
            _name, 
            _uri,
            _isDead
        );
    } 

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _hungaTypes[_hungas[tokenId].typeId].uri[_hungas[tokenId].evolution];
    }

    function aquirePack (uint256 packTypeId) public {
        uint64 commitRound = RNG.futureRound(1);
        _packs[msg.sender].packs.push(Pack(_packTypes[packTypeId], commitRound));
        emit PackAquired(msg.sender, packTypeId, commitRound);
    }

    function openPack () public {
        //take the oldest pack
        Pack memory pack = _packs[msg.sender].packs[_packs[msg.sender].indexToOpen];
        //checks if reveal is ready
        RNG.requireRevealReady(pack.commitRound);
        // get the random source
        bytes32 randomSource = RNG.beaconAt(pack.commitRound);
        //derive a uint from the random source
        uint256 random = FlowCommitRevealLib.deriveUint(randomSource, "open");
        //map to the range of the pack type
        uint256 range = _packTypes[pack.packType.id].toTypeIndex - _packTypes[pack.packType.id].fromTypeIndex + 1;
        uint256 randomIndex = random % range;
        uint256 typeId = _packTypes[pack.packType.id].fromTypeIndex + randomIndex;
        //mint hunga of said type
        _mint(msg.sender, _nextTokenId);
        _hungas[_nextTokenId].id = _nextTokenId;
        _hungas[_nextTokenId].typeId = typeId;
        _hungas[_nextTokenId].typeIndex = randomIndex;
        _hungas[_nextTokenId].level = 1;
        _hungas[_nextTokenId].experience = 0;
        _hungas[_nextTokenId].evolution = 0;
        _hungas[_nextTokenId].fetchCount = 0;
        _hungas[_nextTokenId].isFetching = false;
        _hungas[_nextTokenId].commitRound = 0;
        _nextTokenId += 1;
        emit HungaMinted(msg.sender, _nextTokenId, typeId, randomIndex);

        //remove the pack at index 0;
        _packs[msg.sender].indexToOpen += 1;
    }

    function _calculateProbability(uint256 tokenId) internal returns (uint256) {
        return 100 *(2 ** (0 - _hungas[tokenId].fetchCount) * (_hungas[tokenId].level / 100));
    }

    function sendFetch (uint256 tokenId) public {
        //verify if already fetching
        if(_hungas[tokenId].isFetching) revert("Hunga is already fetching");
        //verify if dead
        if(_hungas[tokenId].isDead) revert("Hunga is dead");
        uint64 commitRound = RNG.futureRound(7);
        _hungas[tokenId].isFetching = true;
        _hungas[tokenId].commitRound = commitRound;
        emit SentFetching(tokenId, commitRound);
    }

    function revealFetch (uint256 tokenId) public {
        RNG.requireRevealReady(_hungas[tokenId].commitRound);
        //verify if fetching
        if(!_hungas[tokenId].isFetching) revert("Hunga is not fetching");
        bytes32 randomSource = RNG.beaconAt(_hungas[tokenId].commitRound);
        uint256 random = FlowCommitRevealLib.deriveUint(randomSource, "fetch");
        uint256 probability = _calculateProbability(tokenId);
        if(random < probability) {
            BANANE.mint(msg.sender, _hungas[tokenId].nextHarvestAmount);
            _xpUp(tokenId, _hungas[tokenId].nextHarvestAmount);
            _hungas[tokenId].nextHarvestAmount += _hungas[tokenId].nextHarvestAmount * _hungas[tokenId].level;
            _hungas[tokenId].fetchCount += 1;
        }
        else {
            BANANE.mint(msg.sender, _hungas[tokenId].nextHarvestAmount/(101 - _hungas[tokenId].level));
            _hungas[tokenId].isDead = true;
            _burn(tokenId);
            emit RIP(tokenId);
        }
        _hungas[tokenId].isFetching = false;
        emit RevealedFetching(tokenId);
    }




    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if(_hungas[tokenId].isFetching) revert("Hunga is fetching");
        return super._update(to, tokenId, auth);
    }
        


    function _xpUp(uint256 tokenId, uint256 xp) internal {
        _hungas[tokenId].experience += xp;
        emit ExperienceUp(tokenId, xp);
        if(_hungas[tokenId].experience >= _hungas[tokenId].level ** 3) 
         _levelUp(tokenId);
    }

    function _levelUp(uint256 tokenId) internal {
        _hungas[tokenId].level += 1;
        _hungas[tokenId].experience = 0;
        //evolve logic
        if(_hungas[tokenId].level % 25 == 0 && _hungas[tokenId].evolution < _hungaMaxEvolution) {
            _hungas[tokenId].evolution += 1;
            emit EvolutionUp(tokenId, _hungas[tokenId].evolution);
        }
        emit LevelUp(tokenId, _hungas[tokenId].level);
    }
}