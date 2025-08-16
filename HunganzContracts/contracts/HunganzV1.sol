// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CadenceRandomConsumer } from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";

contract HunganzV1 is ERC721, Ownable, CadenceRandomConsumer {
    uint256 private _nextTokenId;
    uint256 private _nextTypeId;

    mapping(uint256 => Hunga) private _hungas;
    mapping(uint256 => HungaType) private _hungaTypes;

    uint256 private _hungaTypeCount;
    uint256 private _hungaCount;
    
    uint256 private _hungaMaxLevel = 100;
    uint256 private _hungaMaxEvolution = 4;

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

        uint256 fetchCount;
        bool isFetching;
        bool isAlive;
    }

    string[4] private _rarityNames = ["common", "rare", "epic", "legendary"];
    string[4] private _elementNames = ["fire", "water", "plant", "air"];

    constructor() ERC721("Hunga", "HNG") Ownable(msg.sender) {}

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
                     bool isAlive,
                     string memory name, 
                     string memory uri) {

        address _owner = _ownerOf(tokenId);
        uint256 _id = _hungas[tokenId].id;
        uint256 _typeId = _hungas[tokenId].typeId;
        uint256 _typeIndex = _hungas[tokenId].typeIndex;
        uint256 _level = _hungas[tokenId].level;
        uint256 _experience = _hungas[tokenId].experience;
        uint256 _evolution = _hungas[tokenId].evolution;
        uint256 _fetchCount = _hungas[tokenId].fetchCount;
        bool _isFetching = _hungas[tokenId].isFetching;
        bool _isAlive = _hungas[tokenId].isAlive;

        uint256 _rarity = _hungaTypes[_typeId].rarity;
        uint256 _element = _hungaTypes[_typeId].element;

        string memory _name = _hungaTypes[_typeId].name[_typeIndex];
        string memory _uri = _hungaTypes[_typeId].uri[_evolution];

        return 
           (_owner, 
            _id, 
            _typeId, 
            _typeIndex, 
            _level, 
            _experience, 
            _evolution, 
            _fetchCount, 
            _isFetching, 
            _isAlive, 
            _rarity, 
            _element, 
            _name, 
            _uri
        );
    } 

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _hungaTypes[_hungas[tokenId].typeId].uri[_hungas[tokenId].evolution ];
    }

    function packHunga () public {

    }

    function fetchBanana () public {

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
        _hungas[tokenId].health += _hungaTypes[_hungas[tokenId].typeId].baseHealth;
        //evolve logic
        if(_hungas[tokenId].level % 25 == 0 && _hungas[tokenId].evolution < _hungaMaxEvolution) {
            _hungas[tokenId].evolution += 1;
            emit EvolutionUp(tokenId, _hungas[tokenId].evolution);
        }
        emit LevelUp(tokenId, _hungas[tokenId].level);
    }


}