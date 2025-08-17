// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal interface exposed by the Flow Cadence randomness bridge/precompile.
interface IFlowRandomness {
    function flowBlockHeight() external view returns (uint64);
    function getRandomSource(uint64 round) external returns (bytes32);
}

/**
 * @title FlowCommitRevealLib
 * @notice Super-light helpers for commit→reveal on Flow:
 *         - figure out the current round (Flow block height)
 *         - pick a future round
 *         - check/require that reveal is ready
 *         - (optional) fetch beacon and derive a uint
 *
 * Use with either an `IFlowRandomness` instance or just an `address` to the precompile.
 */
library FlowCommitRevealLib {
    // ---------- Types & errors ----------
    error EarlyReveal(uint64 needAtLeast, uint64 have);

    // ---------- Core round helpers ----------

    /// @notice Current Flow round (Flow block height).
    function currentRound(IFlowRandomness rng) internal view returns (uint64) {
        return rng.flowBlockHeight();
    }

    /// @notice Same as above but passing a raw address.
    function currentRound(address rng) internal view returns (uint64) {
        return IFlowRandomness(rng).flowBlockHeight();
    }

    /// @notice Pick a future round: current + roundsAhead.
    function futureRound(IFlowRandomness rng, uint64 roundsAhead) internal view returns (uint64) {
        return rng.flowBlockHeight() + roundsAhead;
    }

    function futureRound(address rng, uint64 roundsAhead) internal view returns (uint64) {
        return IFlowRandomness(rng).flowBlockHeight() + roundsAhead;
    }

    // ---------- Reveal readiness ----------

    /// @notice Is reveal ready yet? Returns (ready, currentRoundValue).
    function isRevealReady(IFlowRandomness rng, uint64 targetRound)
        internal
        view
        returns (bool ready, uint64 current)
    {
        current = rng.flowBlockHeight();
        ready = (current >= targetRound);
    }

    function isRevealReady(address rng, uint64 targetRound)
        internal
        view
        returns (bool ready, uint64 current)
    {
        current = IFlowRandomness(rng).flowBlockHeight();
        ready = (current >= targetRound);
    }

    /// @notice Revert if `current < targetRound`. Returns the current round on success.
    function requireRevealReady(IFlowRandomness rng, uint64 targetRound) internal view returns (uint64 current) {
        current = rng.flowBlockHeight();
        if (current < targetRound) revert EarlyReveal(targetRound, current);
    }

    function requireRevealReady(address rng, uint64 targetRound) internal view returns (uint64 current) {
        current = IFlowRandomness(rng).flowBlockHeight();
        if (current < targetRound) revert EarlyReveal(targetRound, current);
    }

    // ---------- Optional conveniences ----------

    /// @notice Fetch the randomness beacon for a given round.
    function beaconAt(IFlowRandomness rng, uint64 round) internal returns (bytes32) {
        return rng.getRandomSource(round);
    }

    function beaconAt(address rng, uint64 round) internal returns (bytes32) {
        return IFlowRandomness(rng).getRandomSource(round);
    }

    /// @notice Derive a uint256 from a beacon with optional personalization (e.g., user/requestId).
    function deriveUint(bytes32 beacon, bytes memory personalization) internal pure returns (uint256) {
        // You can call with empty bytes("") if you don't need personalization.
        return uint256(keccak256(abi.encodePacked(beacon, personalization)));
    }
}
