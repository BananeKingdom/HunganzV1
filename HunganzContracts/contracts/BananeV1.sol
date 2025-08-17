pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Banane Token
 * @dev ERC20 token representing Banane (Banana in French)
 * Features:
 * - Standard ERC20 functionality
 * - Minting capability (Map contract only)
 * - Burning capability (Map contract only)
 * - 18 decimal places
 */
contract BananeV1 is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 24_000_000_000 * 10**18; // 1 billion tokens

    address public hunanz;
    
    event BananeMinted(address indexed to, uint256 amount);
    event BananeBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     * @param initialSupply The initial supply of tokens (in wei, 18 decimals)
     */
    constructor(
        uint256 initialSupply
    ) ERC20("Banane", "BANANE") Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
            emit BananeMinted(msg.sender, initialSupply);
        }
    }

    function addHunganzContract(address contract_) public onlyOwner {
        hunanz = contract_;
    }

    modifier onlyHunganzContract() {
        if(msg.sender != hunanz) revert("Not a hunganz contract");
        _;
    }
    
    /**
     * @dev Mint new tokens. Only callable by owner.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyHunganzContract {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(to, amount);
        emit BananeMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from the caller's account
     * @param amount The amount of tokens to burn (in wei)
     */
    function burn(uint256 amount) external onlyHunganzContract {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit BananeBurned(msg.sender, amount);
    }

    
    /**
     * @dev Get the maximum supply of tokens
     * @return The maximum supply in wei
     */
    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }
    
    /**
     * @dev Get the remaining mintable supply
     * @return The remaining mintable supply in wei
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}

interface IBananeV1 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function maxSupply() external pure returns (uint256);
    function remainingMintableSupply() external view returns (uint256);
}

