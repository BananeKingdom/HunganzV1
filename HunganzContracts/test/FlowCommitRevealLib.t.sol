// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../contracts/FlowCommitRevealLib.sol";
import "../contracts/test/MockFlowRandomness.t.sol";

contract FlowCommitRevealLibTest is Test {
    using FlowCommitRevealLib for IFlowRandomness;
    using FlowCommitRevealLib for address;

    MockFlowRandomness public mockRng;
    
    function setUp() public {
        mockRng = new MockFlowRandomness();
    }

    function test_RequireRevealReadySuccess() public {
        uint64 commitRound = mockRng.currentRound() + 2;
        
        // Advance past the commit round
        mockRng.advanceBlocks(3);
        
        // Should not revert
        FlowCommitRevealLib.requireRevealReady(address(mockRng), commitRound);
    }

    function test_RequireRevealReadyFailure() public {
        uint64 currentRound = mockRng.currentRound();
        uint64 commitRound = currentRound + 5;
        
        // Debug: Check the actual values
        console.log("Current round:", currentRound);
        console.log("Commit round:", commitRound);
        console.log("Block number:", block.number);
        
        // Try to reveal too early - should revert
        vm.expectRevert(abi.encodeWithSelector(FlowCommitRevealLib.EarlyReveal.selector, commitRound, currentRound));
        this.callRequireRevealReady(address(mockRng), commitRound);
    }
    
    // Helper function to make the library call external so we can use vm.expectRevert
    function callRequireRevealReady(address rng, uint64 targetRound) external {
        FlowCommitRevealLib.requireRevealReady(rng, targetRound);
    }

    function test_RequireRevealReadyWithAddress() public {
        uint64 commitRound = address(mockRng).currentRound() + 2;
        
        // Advance past the commit round
        mockRng.advanceBlocks(3);
        
        // Should not revert
        FlowCommitRevealLib.requireRevealReady(address(mockRng), commitRound);
    }

    function test_BeaconAt() public {
        uint64 round = 100;
        
        bytes32 beacon = FlowCommitRevealLib.beaconAt(address(mockRng), round);
        
        // Should be deterministic
        bytes32 beacon2 = FlowCommitRevealLib.beaconAt(address(mockRng), round);
        assertEq(beacon, beacon2);
        
        // Should be non-zero
        assertTrue(beacon != bytes32(0));
    }

    function test_BeaconAtWithAddress() public {
        uint64 round = 200;
        
        bytes32 beacon = FlowCommitRevealLib.beaconAt(address(mockRng), round);
        bytes32 beacon2 = FlowCommitRevealLib.beaconAt(address(mockRng), round);
        
        assertEq(beacon, beacon2);
        assertTrue(beacon != bytes32(0));
    }

    function test_DeriveUint() public {
        bytes32 randomSource = keccak256("test");
        bytes memory salt = bytes("derive_test");
        
        uint256 derived = FlowCommitRevealLib.deriveUint(randomSource, salt);
        
        // Should be deterministic
        uint256 derived2 = FlowCommitRevealLib.deriveUint(randomSource, salt);
        assertEq(derived, derived2);
        
        // Different salt should give different result
        uint256 derived3 = FlowCommitRevealLib.deriveUint(randomSource, bytes("different_salt"));
        assertTrue(derived != derived3);
    }

    function test_DeriveUintWithBytes() public {
        bytes32 randomSource = keccak256("test");
        bytes memory salt = "derive_test_bytes";
        
        uint256 derived = FlowCommitRevealLib.deriveUint(randomSource, salt);
        uint256 derived2 = FlowCommitRevealLib.deriveUint(randomSource, salt);
        
        assertEq(derived, derived2);
    }

    function test_FullCommitRevealCycle() public {
        // Simulate a full commit-reveal cycle
        
        // 1. Make a commit for future round
        uint64 commitRound = mockRng.futureRound(10);
        
        // 2. Verify reveal is not ready yet
        vm.expectRevert();
        this.callRequireRevealReady(address(mockRng), commitRound);
        
        // 3. Advance time
        mockRng.advanceBlocks(10);
        
        // 4. Verify reveal is now ready
        FlowCommitRevealLib.requireRevealReady(address(mockRng), commitRound);
        
        // 5. Get beacon and derive value
        bytes32 beacon = FlowCommitRevealLib.beaconAt(address(mockRng), commitRound);
        uint256 randomValue = FlowCommitRevealLib.deriveUint(beacon, bytes("game_action"));
        
        // 6. Verify consistency
        bytes32 beacon2 = FlowCommitRevealLib.beaconAt(address(mockRng), commitRound);
        uint256 randomValue2 = FlowCommitRevealLib.deriveUint(beacon2, bytes("game_action"));
        
        assertEq(beacon, beacon2);
        assertEq(randomValue, randomValue2);
    }

    function test_MultipleCommitsAndReveals() public {
        uint64[] memory commitRounds = new uint64[](3);
        commitRounds[0] = mockRng.futureRound(2);
        commitRounds[1] = mockRng.futureRound(4);
        commitRounds[2] = mockRng.futureRound(6);
        
        // Advance to reveal all
        mockRng.advanceBlocks(7);
        
        // Reveal all and verify they're different
        bytes32[] memory beacons = new bytes32[](3);
        for (uint i = 0; i < 3; i++) {
            beacons[i] = FlowCommitRevealLib.beaconAt(address(mockRng), commitRounds[i]);
        }
        
        // All beacons should be different
        assertTrue(beacons[0] != beacons[1]);
        assertTrue(beacons[1] != beacons[2]);
        assertTrue(beacons[0] != beacons[2]);
    }

    function test_DifferentSaltsProduceDifferentResults() public {
        bytes32 randomSource = keccak256("common_source");
        
        uint256 result1 = FlowCommitRevealLib.deriveUint(randomSource, "salt1");
        uint256 result2 = FlowCommitRevealLib.deriveUint(randomSource, "salt2");
        uint256 result3 = FlowCommitRevealLib.deriveUint(randomSource, "salt3");
        
        assertTrue(result1 != result2);
        assertTrue(result2 != result3);
        assertTrue(result1 != result3);
    }
}
