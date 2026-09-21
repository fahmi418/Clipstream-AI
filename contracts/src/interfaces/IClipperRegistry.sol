// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IClipperRegistry {
    struct ClipperStats {
        uint128 totalEarned;
        uint64 totalViewsVerified;
        uint32 clipsApproved;
        uint32 clipsRejected;
    }

    function recordPayout(address clipper, uint256 campaignId, uint128 amount, uint32 views) external;
    function recordRejection(address clipper) external;
    function stats(address clipper) external view returns (ClipperStats memory);
    function approvalRate(address clipper) external view returns (uint256 rateBps);

    event PayoutRecorded(address indexed clipper, uint256 indexed campaignId, uint128 amount, uint32 views);
    event RejectionRecorded(address indexed clipper);
}
