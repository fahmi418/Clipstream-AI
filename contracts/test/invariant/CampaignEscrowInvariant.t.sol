// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { StdInvariant } from "forge-std/StdInvariant.sol";
import { EscrowTestBase } from "../unit/CampaignEscrow.t.sol";
import { ICampaignEscrow } from "../../src/interfaces/ICampaignEscrow.sol";
import { CampaignEscrow } from "../../src/CampaignEscrow.sol";

/// Handler that orchestrates actions on CampaignEscrow for invariant testing.
contract EscrowHandler is Test {
    CampaignEscrow public escrow;
    address public agentAddr;
    uint256 public agentKey;
    address public brand;
    address public clipper;

    uint256 public campaignId;
    uint256 public clipId;
    bytes32 public videoHash;
    uint32 public currentViews = 1000;
    uint256 public nonceCounter = 100;

    constructor(
        address escrowAddr,
        address agent_,
        uint256 agentKey_,
        address brand_,
        address clipper_
    ) {
        escrow = CampaignEscrow(payable(escrowAddr));
        agentAddr = agent_;
        agentKey = agentKey_;
        brand = brand_;
        clipper = clipper_;

        vm.deal(brand, 100 ether);
        vm.prank(brand);
        campaignId = escrow.createCampaign{value: 10 ether}(
            address(0),
            10 ether,
            0.01 ether,
            3 ether,
            100,
            uint64(block.timestamp + 30 days),
            keccak256("src"),
            keccak256("rls")
        );

        videoHash = keccak256("video-invariant");
        vm.prank(agentAddr);
        clipId = escrow.registerClip(campaignId, clipper, videoHash);
    }

    function releaseNextMilestone(uint32 deltaViews, uint16 anomalyBps) external {
        deltaViews = uint32(bound(deltaViews, 100, 5000));
        anomalyBps = uint16(bound(anomalyBps, 0, 7400)); // below flag threshold

        currentViews += deltaViews;
        nonceCounter++;

        // Advance 31 minutes to respect MIN_RELEASE_INTERVAL
        vm.warp(block.timestamp + 31 minutes);

        ICampaignEscrow.Attestation memory att = ICampaignEscrow.Attestation({
            clipId: clipId,
            campaignId: campaignId,
            clipper: clipper,
            videoIdHash: videoHash,
            verifiedViews: currentViews,
            sourceMatchBps: 8000,
            safetyBps: 8000,
            anomalyBps: anomalyBps,
            evidenceHash: keccak256(abi.encodePacked("ev", nonceCounter)),
            nonce: nonceCounter,
            expiry: uint64(block.timestamp + 1 hours)
        });

        bytes32 structHash = keccak256(abi.encode(
            keccak256(
                "Attestation("
                "uint256 clipId,"
                "uint256 campaignId,"
                "address clipper,"
                "bytes32 videoIdHash,"
                "uint32 verifiedViews,"
                "uint16 sourceMatchBps,"
                "uint16 safetyBps,"
                "uint16 anomalyBps,"
                "bytes32 evidenceHash,"
                "uint256 nonce,"
                "uint64 expiry"
                ")"
            ),
            att.clipId,
            att.campaignId,
            att.clipper,
            att.videoIdHash,
            att.verifiedViews,
            att.sourceMatchBps,
            att.safetyBps,
            att.anomalyBps,
            att.evidenceHash,
            att.nonce,
            att.expiry
        ));

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(agentKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        // Try release; may reach budget cap or clip cap
        try escrow.releaseMilestone(att, sig) {} catch {}
    }

    function claimMaturedHoldback() external {
        vm.warp(block.timestamp + 8 days);
        try escrow.claimHoldback(clipId) {} catch {}
    }
}

contract CampaignEscrowInvariantTest is EscrowTestBase {
    EscrowHandler internal handler;

    function setUp() public override {
        super.setUp();
        handler = new EscrowHandler(
            address(escrow),
            agentAddr,
            agentKey,
            brand,
            clipper1
        );
        targetContract(address(handler));
    }

    /// Invariant 1: Escrow Native BNB balance must always equal remaining + allocated
    function invariant_SolvencyConservation() public view {
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(handler.campaignId());
        assertEq(address(escrow).balance, c.remaining + c.allocated);
    }

    /// Invariant 2: Clip payout never exceeds the configured cap
    function invariant_ClipCapRespected() public view {
        ICampaignEscrow.Clip memory clip = escrow.getClip(handler.clipId());
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(handler.campaignId());
        assertLe(clip.releasedAmount + clip.holdbackAmount, c.maxPayoutPerClip);
    }

    /// Invariant 3: Campaign remaining + allocated + clip.releasedAmount == totalBudget
    function invariant_TotalBudgetConservation() public view {
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(handler.campaignId());
        ICampaignEscrow.Clip memory clip = escrow.getClip(handler.clipId());
        assertEq(c.remaining + c.allocated + clip.releasedAmount, c.totalBudget);
    }
}

