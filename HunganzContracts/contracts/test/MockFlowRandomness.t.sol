// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../FlowCommitRevealLib.sol";

/**
 * @title MockFlowRandomness
 * @dev Mock implementation of IFlowRandomness for testing purposes
 * Provides pseudorandom bytes32 values based on block properties and round numbers
 */
contract MockFlowRandomness is IFlowRandomness {
    uint64 private _currentBlockHeight;
    mapping(uint64 => bytes32) private _randomSources;
    
    event BlockHeightUpdated(uint64 newHeight);
    event RandomSourceGenerated(uint64 round, bytes32 source);
    
    constructor() {
        _currentBlockHeight = uint64(block.number);
    }
    
    /**
     * @dev Returns the current Flow block height (mocked)
     * @return Current block height
     */
    function flowBlockHeight() external view override returns (uint64) {
        return _currentBlockHeight;
    }
    
    /**
     * @dev Returns the current round (equivalent to block height in this mock)
     * @return Current round number
     */
    function currentRound() external view returns (uint64) {
        return _currentBlockHeight;
    }
    
    /**
     * @dev Returns a future round number by adding rounds to current round
     * @param roundsAhead Number of rounds to add to current round
     * @return Future round number
     */
    function futureRound(uint64 roundsAhead) external view returns (uint64) {
        return _currentBlockHeight + roundsAhead;
    }
    
    /**
     * @dev Gets a pseudorandom source for a given round
     * @param round The round number to get randomness for
     * @return Pseudorandom bytes32 value
     */
    function getRandomSource(uint64 round) external returns (bytes32) {
        // If we already generated a source for this round, return it
        if (_randomSources[round] != bytes32(0)) {
            return _randomSources[round];
        }
        
        // Generate pseudorandom source based on round, block properties, and timestamp
        bytes32 source = keccak256(abi.encodePacked(
            round,
            block.timestamp,
            block.difficulty,
            block.coinbase,
            blockhash(block.number - 1),
            _currentBlockHeight
        ));
        
        // Store the generated source
        _randomSources[round] = source;
        emit RandomSourceGenerated(round, source);
        
        return source;
    }
    
    /**
     * @dev Gets a stored random source for a given round (read-only)
     * @param round The round number to get the stored randomness for
     * @return The stored bytes32 value, or bytes32(0) if not found
     */
    function getStoredRandomSource(uint64 round) external view returns (bytes32) {
        return _randomSources[round];
    }
    
    /**
     * @dev Manually advance the block height (for testing)
     * @param newHeight The new block height to set
     */
    function setBlockHeight(uint64 newHeight) external {
        require(newHeight >= _currentBlockHeight, "Cannot go backwards in time");
        _currentBlockHeight = newHeight;
        emit BlockHeightUpdated(newHeight);
    }
    
    /**
     * @dev Advance block height by a certain amount
     * @param blocks Number of blocks to advance
     */
    function advanceBlocks(uint64 blocks) external {
        _currentBlockHeight += blocks;
        emit BlockHeightUpdated(_currentBlockHeight);
    }
    
    /**
     * @dev Check if a random source has been generated for a round
     * @param round The round to check
     * @return True if source exists, false otherwise
     */
    function hasRandomSource(uint64 round) external view returns (bool) {
        return _randomSources[round] != bytes32(0);
    }
    
    /**
     * @dev Reset all stored random sources (for testing)
     */
    function clearRandomSources() external {
        // Note: This is a simplified reset - in a real scenario you'd need to iterate
        // For testing purposes, you can call this and then regenerate sources as needed
        _currentBlockHeight = uint64(block.number);
    }
}
