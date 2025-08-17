// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CadenceRandomConsumer } from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";

contract Hunganz is ERC721, Ownable, CadenceRandomConsumer {
    mapping (address => bool) public packContract;
    mapping (address => bool) public mapContract;

    uint256 private _nextTokenId;
    uint256 private _nextTypeId;

    mapping(uint256 => Hunga) private _hungas;
    mapping(uint256 => HungaType) private _hungaTypes;

    uint256 private _hungaTypeCount;
    uint256 private _hungaCount;

    string[] private _rarityNames;
    string[] private _elementNames;
    
    uint256 private _hungaMaxLevel;
    uint256 private _hungaMaxEvolution;

    struct HungaType {
        uint256 id;
        mapping (uint256 => string) name;
        uint256 rarity;
        uint256 element;
        mapping (uint256 => string) uri;
        uint256 altCount;
        uint256 baseHealth;
        uint256 totalSupply;
        uint256 maxTrauma;
    }

    struct Hunga {
        uint256 id;
        uint256 typeId;
        uint256 typeIndex;
        uint256 typeAlt; // 0 if default

        uint256 level;
        uint256 experience;
        uint256 evolution;

        uint256 health;
        uint256 trauma;
    }

    event RarityAdded(uint256 indexed rarityId, string rarityName);
    event ElementAdded(uint256 indexed elementId, string elementName);
    event TypeAdded(uint256 indexed typeId, string [] name, uint256 rarity, uint256 element, string [] uri, uint256 baseHealth);
    event TypeAdded(uint256 indexed typeId, string [] uri);
    event PackContractAdded(address indexed contractAddress);
    event MapContractAdded(address indexed contractAddress);
    event DamageTaken(uint256 indexed tokenId, uint256 damage);
    event TraumaUp(uint256 indexed tokenId, uint256 trauma);
    event TraumaMaxUp(uint256 indexed typeId, uint256 maxTrauma);
    event ExperienceUp(uint256 indexed tokenId, uint256 xp);
    event LevelUp(uint256 indexed tokenId, uint256 level);
    event HealthUp(uint256 indexed tokenId, uint256 health);
    event RipInPiece(uint256 indexed tokenId);

    constructor() ERC721("Hunga", "HNG") Ownable(msg.sender) {}


    function addType(string [] memory name_, uint256 rarity_, uint256 element_, string [] memory uri_, uint256 baseHealth_) public onlyOwner {
        if(rarity_ >= _rarityNames.length) revert("Invalid rarity");
        if(element_ >= _elementNames.length) revert("Invalid element");
        if(uri_.length != _hungaMaxEvolution) revert("Invalid URI array length");
        if(name_.length != _hungaMaxEvolution) revert("Invalid name array length");

        uint256 id = _nextTypeId;
        _nextTypeId += 1;

        _hungaTypes[id].id = id;
        _hungaTypes[id].rarity = rarity_;
        _hungaTypes[id].element = element_;
        _hungaTypes[id].baseHealth = baseHealth_;
        _hungaTypes[id].totalSupply = 0;
        _hungaTypes[id].altCount = 0;

        for(uint256 i = 0; i < _hungaMaxEvolution; i++) {
            _hungaTypes[id].name[i] = name_[i];
            _hungaTypes[id].uri[i] = uri_[i];
        }
        
        emit TypeAdded(id, name_, rarity_, element_, uri_, baseHealth_);
    }

    function addRarity(string memory name_) public onlyOwner {
        _rarityNames.push(name_);
        emit RarityAdded(_rarityNames.length - 1, name_);
    }

    function addElement(string memory name_) public onlyOwner {
        _elementNames.push(name_);
        emit ElementAdded(_elementNames.length - 1, name_);
    }

    function addAltUri(uint256 typeId_, string [] memory uri_) public onlyOwner {
        if(uri_.length != _hungaMaxEvolution) revert("URI array must have the same length as the type URI array");
        for(uint256 i = 0; i < uri_.length; i++) 
            _hungaTypes[typeId_].uri[i + _hungaMaxEvolution * _hungaTypes[typeId_].altCount] = uri_[i];
        _hungaTypes[typeId_].altCount += 1;
        emit TypeAdded(typeId_, uri_);
    }



    function addPackContract(address contract_) public onlyOwner {
        packContract[contract_] = true;
        emit PackContractAdded(contract_);
    }

    function addMapContract(address contract_) public onlyOwner {
        mapContract[contract_] = true;
        emit MapContractAdded(contract_);
    }

    modifier onlyPackContract() {
        if(!packContract[msg.sender]) revert("Not a pack contract");
        _;
    }

    modifier onlyMapContract() {
        if(!mapContract[msg.sender]) revert("Not a map contract");
        _;
    }

    







    function getHunga(uint256 tokenId) public view 
            returns (address owner, 
                     uint256 id, 
                     uint256 typeId, 
                     uint256 typeIndex, 
                     uint256 typeAlt, 
                     uint256 level, 
                     uint256 experience, 
                     uint256 evolution, 
                     uint256 health, 
                     uint256 trauma, 
                     uint256 rarity, 
                     uint256 element, 
                     string memory typeName, 
                     string memory typeUri) {
        address _owner = _ownerOf(tokenId);
        uint256 _id = _hungas[tokenId].id;
        uint256 _typeId = _hungas[tokenId].typeId;
        uint256 _typeIndex = _hungas[tokenId].typeIndex;
        uint256 _typeAlt = _hungas[tokenId].typeAlt;

        uint256 _level = _hungas[tokenId].level;
        uint256 _experience = _hungas[tokenId].experience;
        uint256 _evolution = _hungas[tokenId].evolution;

        uint256 _health = _hungas[tokenId].health;
        uint256 _trauma = _hungas[tokenId].trauma;

        uint256 _rarity = _hungaTypes[_typeId].rarity;
        uint256 _element = _hungaTypes[_typeId].element;
        string memory _typeName = _hungaTypes[_typeId].name[_typeIndex];
        string memory _typeUri = _hungaTypes[_typeId].uri[_evolution + _typeAlt * _hungaMaxEvolution];

        return 
           (_owner, 
            _id, 
            _typeId, 
            _typeIndex, 
            _typeAlt, 
            _level, 
            _experience, 
            _evolution, 
            _health, 
            _trauma, 
            _rarity, 
            _element, 
            _typeName, 
            _typeUri
        );
    }
    

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        return _hungaTypes[_hungas[tokenId].typeId]
                .uri[_hungas[tokenId].evolution + _hungas[tokenId].typeAlt * _hungaMaxEvolution];
    }



    //pack contract
    function mint(address to, uint256 typeId, uint256 typeAlt) public onlyPackContract {
        _safeMint(to, _nextTokenId);
        uint256 index = _hungaTypes[typeId].totalSupply;
        _hungas[_nextTokenId] = Hunga(_nextTokenId, typeId, index, typeAlt, 1, 0, 0, _hungaTypes[typeId].baseHealth, 0);
        _hungaTypes[typeId].totalSupply += 1;
        _nextTokenId += 1;
    }


    //map contract
    function damage(uint256 tokenId, uint256 damage) public onlyMapContract {
        _hungas[tokenId].health -= damage;
        emit DamageTaken(tokenId, damage);
        if(_hungas[tokenId].health <= 0) {
            _hungas[tokenId].health = 0;
            _hungaTypes[_hungas[tokenId].typeId].totalSupply -= 1;
            _burn(tokenId);
            emit RipInPiece(tokenId);
        }
    }

    function traumaUp(uint256 tokenId, uint256 trauma) public onlyMapContract {
        _hungas[tokenId].trauma += trauma;
        emit TraumaUp(tokenId, trauma);
        if(_hungas[tokenId].trauma > _hungaTypes[_hungas[tokenId].typeId].maxTrauma) {
            _hungaTypes[_hungas[tokenId].typeId].maxTrauma += 1;
            _hungas[tokenId].trauma = _hungaTypes[_hungas[tokenId].typeId].maxTrauma;
            emit TraumaMaxUp(_hungas[tokenId].typeId, _hungaTypes[_hungas[tokenId].typeId].maxTrauma);
        }
    }

    function xpUp(uint256 tokenId, uint256 xp) public onlyMapContract {
        require(_hungas[tokenId].level < _hungaMaxLevel, "Max level reached");
        _hungas[tokenId].experience += xp;
        emit ExperienceUp(tokenId, xp);
        if(_hungas[tokenId].experience >= _hungas[tokenId].level ** 3) 
         _levelUp(tokenId);
    }

    function _levelUp(uint256 tokenId) internal {
        require(_hungas[tokenId].level < _hungaMaxLevel, "Max level reached");
        _hungas[tokenId].level += 1;
        _hungas[tokenId].experience = 0; 

        uint256 randomValue = _getRevertibleRandomInRange(0, 10000);

        uint256 trauma = _hungas[tokenId].trauma/ _hungaTypes[_hungas[tokenId].typeId].maxTrauma * 100;
        uint256 k = 444 * (1 +  20 * (2 * trauma - 100) / 100);
        uint256 level = _hungaMaxLevel / _hungaMaxEvolution * (2 * _hungas[tokenId].evolution - 1) / 2;

        uint256 p = (10000 * 10000) / (10000 + (10000 * 2 ** (k * (level - _hungas[tokenId].level) / 1000)));  

        if (randomValue < p) {
            if (_hungas[tokenId].evolution < _hungaMaxEvolution) 
                _hungas[tokenId].evolution += 1;
            
        } 
        
        _hungas[tokenId].health += (_hungas[tokenId].evolution / _hungaMaxEvolution) *_hungaTypes[_hungas[tokenId].typeId].baseHealth; 
        emit LevelUp(tokenId, _hungas[tokenId].level);
        emit HealthUp(tokenId, _hungas[tokenId].health);
    }
}

interface IHunganz {
    function mint(address to, uint256 typeId, uint256 typeAlt) external;
    function damage(uint256 tokenId, uint256 damage) external;
    function levelUp(uint256 tokenId) external;
    function xpUp(uint256 tokenId, uint256 xp) external;
    function traumaUp(uint256 tokenId, uint256 trauma) external;
    function getHunga(uint256 tokenId) external view returns (address owner, uint256 id, uint256 typeId, uint256 typeIndex, uint256 typeAlt, uint256 level, uint256 experience, uint256 evolution, uint256 health, uint256 trauma, uint256 rarity, uint256 element, string memory typeName, string memory typeUri); 
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
