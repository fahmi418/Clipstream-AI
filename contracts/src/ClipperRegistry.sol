// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IClipperRegistry } from "./interfaces/IClipperRegistry.sol";

/// On-chain reputation ledger. Only the escrow contract can write.
/// approvalRate computed at read-time to save one SSTORE per update.
contract ClipperRegistry is IClipperRegistry {
    address public escrow;
    mapping(address => ClipperStats) private _stats;

    error NotEscrow();
    error EscrowAlreadySet();

    modifier onlyEscrow() {
        if (msg.sender != escrow) revert NotEscrow();
        _;
    }

    /// Set once after deployment. Cannot be changed -- if escrow migrates,
    /// deploy a new registry and port the data via events.
    function setEscrow(address escrowAddress) external {
        if (escrow != address(0)) revert EscrowAlreadySet();
        escrow = escrowAddress;
    }

    function recordPayout(
        address clipper,
        uint256 campaignId,
        uint128 amount,
        uint32 views
    ) external onlyEscrow {
        ClipperStats storage s = _stats[clipper];
        s.totalEarned += amount;
        s.totalViewsVerified += views;
        s.clipsApproved += 1;
        emit PayoutRecorded(clipper, campaignId, amount, views);
    }

    function recordRejection(address clipper) external onlyEscrow {
        _stats[clipper].clipsRejected += 1;
        emit RejectionRecorded(clipper);
    }

    function stats(address clipper) external view returns (ClipperStats memory) {
        return _stats[clipper];
    }

    /// Returns approval rate in basis points (0-10000).
    /// New clippers with no history return 5000 (50%) as neutral prior.
    function approvalRate(address clipper) external view returns (uint256 rateBps) {
        ClipperStats storage s = _stats[clipper];
        uint256 total = uint256(s.clipsApproved) + uint256(s.clipsRejected);
        if (total == 0) return 5000;
        return (uint256(s.clipsApproved) * 10000) / total;
    }
}
