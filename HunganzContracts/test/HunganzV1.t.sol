// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HunganzV1.sol";
import "../contracts/BananeV1.sol";
import "../contracts/test/MockFlowRandomness.t.sol";
import "../contracts/FlowCommitRevealLib.sol";

contract HunganzV1Test is Test {
    using FlowCommitRevealLib for IFlowRandomness;

    HunganzV1 public hunganz;
    BananeV1 public banane;
    MockFlowRandomness public mockRng;
    
    address public owner;
    address public user1;
    address public user2;
    
    // Events to test
    event TypeAdded(uint256 id, string name, uint256 rarity, uint256 element, string[] uri);
    event HungaMinted(address indexed user, uint256 tokenId, uint256 typeId, uint256 typeIndex);
    event PackAquired(address indexed user, uint256 packTypeId, uint64 commitRound);
    event PackOpened(address indexed user, uint256 packTypeId, uint64 commitRound);
    event SentFetching(uint256 tokenId, uint64 commitRound);
    event RevealedFetching(uint256 tokenId);
    event RIP(uint256 tokenId);
    event LevelUp(uint256 tokenId, uint256 level);
    event ExperienceUp(uint256 tokenId, uint256 experience);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.startPrank(owner);
        
        // Deploy mock randomness
        mockRng = new MockFlowRandomness();
        
        // Deploy Banane token with initial supply
        banane = new BananeV1(1000000 * 10**18); // 1M initial tokens
        
        // Deploy Hunganz contract
        hunganz = new HunganzV1(address(mockRng), address(banane));
        
        // Set Hunganz contract as authorized minter for Banane
        banane.addHunganzContract(address(hunganz));
        
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(hunganz.name(), "Hunga");
        assertEq(hunganz.symbol(), "HNG");
        assertEq(hunganz.owner(), owner);
        assertEq(address(hunganz.RNG()), address(mockRng));
        assertEq(address(hunganz.BANANE()), address(banane));
    }

    function test_AddType() public {
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        vm.expectEmit(true, true, true, true);
        emit TypeAdded(0, "Fire Dragon", 0, 0, uris);
        
        hunganz.addType("Fire Dragon", 0, 0, uris); // common fire type
        
        vm.stopPrank();
    }

    function test_AddTypeInvalidRarity() public {
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        vm.expectRevert("Invalid rarity");
        hunganz.addType("Invalid Dragon", 5, 0, uris); // rarity 5 doesn't exist
        
        vm.stopPrank();
    }

    function test_AddTypeInvalidElement() public {
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        vm.expectRevert("Invalid element");
        hunganz.addType("Invalid Dragon", 0, 5, uris); // element 5 doesn't exist
        
        vm.stopPrank();
    }

    function test_AquireAndOpenPack() public {
        // First add a type and pack type
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        hunganz.addType("Fire Dragon", 0, 0, uris);
        hunganz.addPackType(0, 0); // Pack type 0 contains type 0
        
        vm.stopPrank();
        
        // User acquires pack
        vm.startPrank(user1);
        
        uint64 expectedCommitRound = mockRng.currentRound() + 1;
        
        vm.expectEmit(true, true, true, true);
        emit PackAquired(user1, 0, expectedCommitRound);
        
        hunganz.aquirePack(0);
        
        // Advance blocks to make reveal ready
        mockRng.advanceBlocks(2);
        
        // Open pack
        vm.expectEmit(true, true, true, true);
        emit HungaMinted(user1, 0, 0, 0); // tokenId starts at 0
        
        hunganz.openPack();
        
        // Verify NFT was minted
        assertEq(hunganz.balanceOf(user1), 1);
        assertEq(hunganz.ownerOf(0), user1);
        
        vm.stopPrank();
    }

    function test_SendAndRevealFetch() public {
        // Setup: Add type, pack type, and mint a Hunga
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        hunganz.addType("Fire Dragon", 0, 0, uris);
        hunganz.addPackType(0, 0);
        
        vm.stopPrank();
        
        vm.startPrank(user1);
        
        // Acquire and open pack to get a Hunga
        hunganz.aquirePack(0);
        mockRng.advanceBlocks(2);
        hunganz.openPack();
        
        uint256 tokenId = 0;
        uint256 initialBananeBalance = banane.balanceOf(user1);
        
        // Send fetch
        hunganz.sendFetch(tokenId);
        
        // Advance blocks to make reveal ready
        mockRng.advanceBlocks(8);
        
        // Reveal fetch
        hunganz.revealFetch(tokenId);
        
        // Check that user received some Banane tokens
        uint256 finalBananeBalance = banane.balanceOf(user1);
        assertGt(finalBananeBalance, initialBananeBalance);
        
        vm.stopPrank();
    }

    function test_CannotSendFetchWhileAlreadyFetching() public {
        // Setup
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        hunganz.addType("Fire Dragon", 0, 0, uris);
        hunganz.addPackType(0, 0);
        
        vm.stopPrank();
        
        vm.startPrank(user1);
        
        // Get a Hunga
        hunganz.aquirePack(0);
        mockRng.advanceBlocks(2);
        hunganz.openPack();
        
        uint256 tokenId = 0;
        
        // Send first fetch
        hunganz.sendFetch(tokenId);
        
        // Try to send another fetch while first is pending
        vm.expectRevert("Hunga is already fetching");
        hunganz.sendFetch(tokenId);
        
        vm.stopPrank();
    }

    function test_CannotTransferWhileFetching() public {
        // Setup
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        hunganz.addType("Fire Dragon", 0, 0, uris);
        hunganz.addPackType(0, 0);
        
        vm.stopPrank();
        
        vm.startPrank(user1);
        
        // Get a Hunga
        hunganz.aquirePack(0);
        mockRng.advanceBlocks(2);
        hunganz.openPack();
        
        uint256 tokenId = 0;
        
        // Send fetch
        hunganz.sendFetch(tokenId);
        
        // Try to transfer while fetching
        vm.expectRevert("Hunga is fetching");
        hunganz.transferFrom(user1, user2, tokenId);
        
        vm.stopPrank();
    }

    function test_GetHungaInfo() public {
        // Setup
        vm.startPrank(owner);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        hunganz.addType("Fire Dragon", 0, 0, uris);
        hunganz.addPackType(0, 0);
        
        vm.stopPrank();
        
        vm.startPrank(user1);
        
        // Get a Hunga
        hunganz.aquirePack(0);
        mockRng.advanceBlocks(2);
        hunganz.openPack();
        
        uint256 tokenId = 0;
        
        // Get Hunga info using struct-based function
        HunganzV1.HungaInfo memory info = hunganz.getHungaInfo(tokenId);
        
        assertEq(info.owner, user1);
        assertEq(info.id, tokenId);
        assertEq(info.typeId, 0);
        assertEq(info.level, 1);
        assertEq(info.experience, 0);
        assertEq(info.evolution, 0);
        assertEq(info.rarity, 0); // common
        assertEq(info.element, 0); // fire
        assertEq(info.fetchCount, 0);
        assertEq(info.isFetching, false);
        assertEq(info.nextHarvestAmount, 100);
        assertEq(info.name, "Fire Dragon");
        assertEq(info.uri, "ipfs://evolution0");
        assertEq(info.isDead, false);
        
        vm.stopPrank();
    }

    function test_OnlyOwnerCanAddTypes() public {
        vm.startPrank(user1);
        
        string[] memory uris = new string[](4);
        uris[0] = "ipfs://evolution0";
        uris[1] = "ipfs://evolution1";
        uris[2] = "ipfs://evolution2";
        uris[3] = "ipfs://evolution3";
        
        vm.expectRevert();
        hunganz.addType("Unauthorized Dragon", 0, 0, uris);
        
        vm.stopPrank();
    }


    function test_MockRandomnessBlockAdvancement() public {
        uint64 initialHeight = mockRng.flowBlockHeight();
        
        mockRng.advanceBlocks(10);
        
        assertEq(mockRng.flowBlockHeight(), initialHeight + 10);
    }
}
