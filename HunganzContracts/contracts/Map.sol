pragma solidity ^0.8.28;

import {IBanane} from "./Banana.sol";
import {IHunganz} from "./Hunganz.sol";
import {CadenceRandomConsumer} from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";

contract Map is CadenceRandomConsumer {
    address public banane;
    mapping (address => bool) public ;
    
    
    
    struct Hunga {
        address contractAddress;
        uint256 id;
        uint256 height;
    }

    struct Team {
        address player;
        string name;
        Hunga [] hungas;
        uint256 totalHeight;
    }

    function addHunga(address contract_, uint256 id_) public  {
        
    }

    function climbCommit(uint256 id_) public {

    }

    function climbReveal(uint256 id_) public {

    }

    function fetchCommit(uint256 id_) public {

    }

    function fetchReveal(uint256 id_) public {

    }
    
}

