// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { EscrowTestBase } from "../unit/CampaignEscrow.t.sol";
import { ICampaignEscrow } from "../../src/interfaces/ICampaignEscrow.sol";

contract CampaignEscrowFuzzTest is EscrowTestBase {
    function testFuzz_CreateCampaign_ValidParams(
        uint128 budget,
        uint64 cpm,
        uint128 cap,
        uint32 minViews,
        uint32 durationDays
    ) public {
        budget = uint128(bound(budget, 100_000, 1_000_000_000_000));
        cpm = uint64(bound(cpm, 1000, budget));
        cap = uint128(bound(cap, 1, budget));
        minViews = uint32(bound(minViews, 10, 1_000_000));
        durationDays = uint32(bound(durationDays, 2, 365));

        vm.startPrank(brand);
        usdt.mint(brand, budget);
        usdt.approve(address(escrow), budget);

        uint256 campaignId = escrow.createCampaign(
            address(usdt),
            budget,
            cpm,
            cap,
            minViews,
            uint64(block.timestamp + uint256(durationDays) * 1 days),
            keccak256("source"),
            keccak256("rules")
        );
        vm.stopPrank();

        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);
        assertEq(c.totalBudget, budget);
        assertEq(c.remaining, budget);
        assertEq(c.cpmRate, cpm);
        assertEq(c.maxPayoutPerClip, cap);
    }

    function testFuzz_PayoutNeverExceedsCapOrBudget(
        uint32 views,
        uint16 anomalyBps
    ) public {
        views = uint32(bound(views, MIN_VIEWS, 50_000_000));
        anomalyBps = uint16(bound(anomalyBps, 0, escrow.ANOMALY_FLAG_BPS() - 1));

        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, views, 8000, 8000, anomalyBps, 1001
        );

        uint256 clipperBalBefore = usdt.balanceOf(clipper1);
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);

        // Invariant: Total clip payout (released + holdback) never exceeds cap
        assertLe(clip.releasedAmount + clip.holdbackAmount, CAP);
        // Invariant: Total clip payout never exceeds budget
        assertLe(clip.releasedAmount + clip.holdbackAmount, BUDGET);
        // Invariant: Remaining budget plus allocated plus released equals totalBudget
        assertEq(c.remaining + c.allocated + clip.releasedAmount, BUDGET);
        // Clipper received immediate payment
        assertEq(usdt.balanceOf(clipper1) - clipperBalBefore, clip.releasedAmount);
    }

    function testFuzz_NativeBNB_PayoutConservation(
        uint128 budget,
        uint32 views
    ) public {
        budget = uint128(bound(budget, 0.1 ether, 100 ether));
        views = uint32(bound(views, 100, 10_000_000));

        uint64 cpm = uint64(bound(budget / 100, 1000, budget));
        uint128 cap = uint128(bound(budget / 2, 1, budget));

        vm.deal(brand, uint256(budget) + 1 ether);
        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: budget}(
            address(0),
            budget,
            cpm,
            cap,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("src"),
            keccak256("rls")
        );

        (uint256 clipId, bytes32 vHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, vHash, views, 8500, 8500, 1000, 9999
        );

        uint256 clipperBalBefore = clipper1.balance;
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);

        // Immediate BNB transfer matches releasedAmount
        assertEq(clipper1.balance - clipperBalBefore, clip.releasedAmount);
        // Escrow balance matches remaining + allocated
        assertEq(address(escrow).balance, c.remaining + c.allocated);
    }
}
