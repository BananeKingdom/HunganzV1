// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/BananeV1.sol";

contract BananeV1Test is Test {
    BananeV1 public banane;
    
    address public owner;
    address public hunganzContract;
    address public user1;
    address public user2;
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1M tokens
    uint256 public constant MAX_SUPPLY = 24_000_000_000 * 10**18; // 24B tokens
    
    // Events to test
    event BananeMinted(address indexed to, uint256 amount);
    event BananeBurned(address indexed from, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        hunganzContract = makeAddr("hunganzContract");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.startPrank(owner);
        banane = new BananeV1(INITIAL_SUPPLY);
        banane.addHunganzContract(hunganzContract);
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(banane.name(), "Banane");
        assertEq(banane.symbol(), "BANANE");
        assertEq(banane.decimals(), 18);
        assertEq(banane.totalSupply(), INITIAL_SUPPLY);
        assertEq(banane.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(banane.owner(), owner);
        assertEq(banane.hunanz(), hunganzContract);
        assertEq(banane.maxSupply(), MAX_SUPPLY);
    }

    function test_MaxSupplyConstant() public {
        assertEq(banane.MAX_SUPPLY(), MAX_SUPPLY);
        assertEq(banane.maxSupply(), MAX_SUPPLY);
    }

    function test_RemainingMintableSupply() public {
        uint256 expected = MAX_SUPPLY - INITIAL_SUPPLY;
        assertEq(banane.remainingMintableSupply(), expected);
    }

    function test_ConstructorWithZeroSupply() public {
        vm.startPrank(owner);
        BananeV1 newBanane = new BananeV1(0);
        
        assertEq(newBanane.totalSupply(), 0);
        assertEq(newBanane.balanceOf(owner), 0);
        vm.stopPrank();
    }

    function test_ConstructorExceedsMaxSupply() public {
        vm.startPrank(owner);
        vm.expectRevert("Initial supply exceeds max supply");
        new BananeV1(MAX_SUPPLY + 1);
        vm.stopPrank();
    }

    function test_AddHunganzContract() public {
        address newContract = makeAddr("newContract");
        
        vm.startPrank(owner);
        banane.addHunganzContract(newContract);
        assertEq(banane.hunanz(), newContract);
        vm.stopPrank();
    }

    function test_OnlyOwnerCanAddHunganzContract() public {
        address newContract = makeAddr("newContract");
        
        vm.startPrank(user1);
        vm.expectRevert();
        banane.addHunganzContract(newContract);
        vm.stopPrank();
    }

    function test_MintByHunganzContract() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.startPrank(hunganzContract);
        
        vm.expectEmit(true, true, true, true);
        emit BananeMinted(user1, mintAmount);
        
        banane.mint(user1, mintAmount);
        
        assertEq(banane.balanceOf(user1), mintAmount);
        assertEq(banane.totalSupply(), INITIAL_SUPPLY + mintAmount);
        
        vm.stopPrank();
    }

    function test_MintToZeroAddressReverts() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.startPrank(hunganzContract);
        vm.expectRevert("Cannot mint to zero address");
        banane.mint(address(0), mintAmount);
        vm.stopPrank();
    }

    function test_MintExceedsMaxSupplyReverts() public {
        uint256 excessiveAmount = MAX_SUPPLY - INITIAL_SUPPLY + 1;
        
        vm.startPrank(hunganzContract);
        vm.expectRevert("Minting would exceed max supply");
        banane.mint(user1, excessiveAmount);
        vm.stopPrank();
    }

    function test_OnlyHunganzContractCanMint() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        vm.expectRevert("Not a hunganz contract");
        banane.mint(user1, mintAmount);
        vm.stopPrank();
        
        vm.startPrank(owner);
        vm.expectRevert("Not a hunganz contract");
        banane.mint(user1, mintAmount);
        vm.stopPrank();
    }

    function test_BurnByHunganzContract() public {
        uint256 burnAmount = 500 * 10**18;
        
        // First give hunganzContract some tokens
        vm.startPrank(hunganzContract);
        banane.mint(hunganzContract, 1000 * 10**18);
        vm.stopPrank();
        
        // Now burn from hunganzContract's account
        vm.startPrank(hunganzContract);
        
        vm.expectEmit(true, true, true, true);
        emit BananeBurned(hunganzContract, burnAmount);
        
        banane.burn(burnAmount);
        
        vm.stopPrank();
    }

    function test_BurnZeroAmountReverts() public {
        vm.startPrank(hunganzContract);
        vm.expectRevert("Amount must be greater than 0");
        banane.burn(0);
        vm.stopPrank();
    }

    function test_BurnInsufficientBalanceReverts() public {
        uint256 burnAmount = 1000 * 10**18;
        
        vm.startPrank(hunganzContract);
        vm.expectRevert("Insufficient balance to burn");
        banane.burn(burnAmount);
        vm.stopPrank();
    }

    function test_OnlyHunganzContractCanBurn() public {
        uint256 burnAmount = 100 * 10**18;
        
        // Give user1 some tokens first
        vm.startPrank(hunganzContract);
        banane.mint(user1, 1000 * 10**18);
        vm.stopPrank();
        
        vm.startPrank(user1);
        vm.expectRevert("Not a hunganz contract");
        banane.burn(burnAmount);
        vm.stopPrank();
        
        vm.startPrank(owner);
        vm.expectRevert("Not a hunganz contract");
        banane.burn(burnAmount);
        vm.stopPrank();
    }

    function test_StandardERC20Transfer() public {
        uint256 transferAmount = 100 * 10**18;
        
        vm.startPrank(owner);
        banane.transfer(user1, transferAmount);
        
        assertEq(banane.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
        assertEq(banane.balanceOf(user1), transferAmount);
        vm.stopPrank();
    }

    function test_StandardERC20Approve() public {
        uint256 approveAmount = 100 * 10**18;
        
        vm.startPrank(owner);
        banane.approve(user1, approveAmount);
        
        assertEq(banane.allowance(owner, user1), approveAmount);
        vm.stopPrank();
    }

    function test_StandardERC20TransferFrom() public {
        uint256 transferAmount = 100 * 10**18;
        
        // Owner approves user1 to spend
        vm.startPrank(owner);
        banane.approve(user1, transferAmount);
        vm.stopPrank();
        
        // user1 transfers from owner to user2
        vm.startPrank(user1);
        banane.transferFrom(owner, user2, transferAmount);
        
        assertEq(banane.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
        assertEq(banane.balanceOf(user2), transferAmount);
        assertEq(banane.allowance(owner, user1), 0);
        vm.stopPrank();
    }

    function test_MintingUpdatesRemainingSupply() public {
        uint256 mintAmount = 1000 * 10**18;
        uint256 initialRemaining = banane.remainingMintableSupply();
        
        vm.startPrank(hunganzContract);
        banane.mint(user1, mintAmount);
        vm.stopPrank();
        
        assertEq(banane.remainingMintableSupply(), initialRemaining - mintAmount);
    }

    function test_BurningDoesNotAffectMaxSupply() public {
        uint256 mintAmount = 1000 * 10**18;
        uint256 burnAmount = 500 * 10**18;
        
        vm.startPrank(hunganzContract);
        banane.mint(hunganzContract, mintAmount);
        banane.burn(burnAmount);
        vm.stopPrank();
        
        // Max supply should remain constant
        assertEq(banane.maxSupply(), MAX_SUPPLY);
        
        // But remaining mintable supply should increase after burning
        uint256 expectedRemaining = MAX_SUPPLY - INITIAL_SUPPLY - mintAmount + burnAmount;
        assertEq(banane.remainingMintableSupply(), expectedRemaining);
    }

    function test_IBananeV1Interface() public {
        // Test that contract implements the interface correctly
        IBananeV1 iBanane = IBananeV1(address(banane));
        
        assertEq(iBanane.maxSupply(), MAX_SUPPLY);
        assertEq(iBanane.remainingMintableSupply(), banane.remainingMintableSupply());
        
        // Test interface functions work
        vm.startPrank(hunganzContract);
        iBanane.mint(hunganzContract, 100 * 10**18);
        iBanane.burn(50 * 10**18);
        vm.stopPrank();
    }
}
