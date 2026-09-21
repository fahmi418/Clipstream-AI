// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { MockUSDT } from "../../src/MockUSDT.sol";
import { ClipperRegistry } from "../../src/ClipperRegistry.sol";
import { CampaignEscrow } from "../../src/CampaignEscrow.sol";
import { ICampaignEscrow } from "../../src/interfaces/ICampaignEscrow.sol";

/// Base test harness shared across unit, fuzz, invariant, and attack tests.
/// Sets up deployer, agent, brand, clipper accounts and a working escrow.
abstract contract EscrowTestBase is Test {
    MockUSDT internal usdt;
    ClipperRegistry internal registry;
    CampaignEscrow internal escrow;

    address internal deployer = makeAddr("deployer");
    uint256 internal agentKey;
    address internal agentAddr;
    address internal brand = makeAddr("brand");
    address internal clipper1 = makeAddr("clipper1");
    address internal clipper2 = makeAddr("clipper2");

    uint128 internal constant BUDGET = 50_000_000;      // 50 USDT
    uint64 internal constant CPM = 300_000;               // 0.30 USDT per 1k views
    uint128 internal constant CAP = 15_000_000;           // 15 USDT per clip
    uint32 internal constant MIN_VIEWS = 1000;

    function setUp() public virtual {
        (agentAddr, agentKey) = makeAddrAndKey("agent");

        vm.startPrank(deployer);

        usdt = new MockUSDT();
        registry = new ClipperRegistry();
        escrow = new CampaignEscrow(deployer, agentAddr, address(registry));

        registry.setEscrow(address(escrow));
        escrow.setTokenAllowed(address(usdt), true);

        vm.stopPrank();

        // Fund brand
        usdt.mint(brand, 1_000_000 * 1e6);
    }

    /// Helper: create a standard campaign, returns campaignId
    function _createCampaign() internal returns (uint256) {
        return _createCampaignWithBudget(BUDGET);
    }

    function _createCampaignWithBudget(uint128 budget) internal returns (uint256) {
        vm.startPrank(brand);
        usdt.approve(address(escrow), budget);
        uint256 campaignId = escrow.createCampaign(
            address(usdt),
            budget,
            CPM,
            CAP,
            MIN_VIEWS,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );
        vm.stopPrank();
        return campaignId;
    }

    /// Helper: register a clip as agent, returns clipId
    function _registerClip(uint256 campaignId, address clipperAddr) internal returns (uint256, bytes32) {
        bytes32 videoHash = keccak256(abi.encodePacked("youtube", clipperAddr, campaignId));
        vm.prank(agentAddr);
        uint256 clipId = escrow.registerClip(campaignId, clipperAddr, videoHash);
        return (clipId, videoHash);
    }

    /// Helper: build and sign an attestation
    function _signAttestation(
        uint256 clipId,
        uint256 campaignId,
        address clipperAddr,
        bytes32 videoHash,
        uint32 views,
        uint16 matchBps,
        uint16 safetyBps,
        uint16 anomalyBps,
        uint256 nonce
    ) internal view returns (ICampaignEscrow.Attestation memory att, bytes memory sig) {
        att = ICampaignEscrow.Attestation({
            clipId: clipId,
            campaignId: campaignId,
            clipper: clipperAddr,
            videoIdHash: videoHash,
            verifiedViews: views,
            sourceMatchBps: matchBps,
            safetyBps: safetyBps,
            anomalyBps: anomalyBps,
            evidenceHash: keccak256(abi.encodePacked("evidence", clipId, nonce)),
            nonce: nonce,
            expiry: uint64(block.timestamp + 10 minutes)
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
            att.clipId, att.campaignId, att.clipper, att.videoIdHash,
            att.verifiedViews, att.sourceMatchBps, att.safetyBps, att.anomalyBps,
            att.evidenceHash, att.nonce, att.expiry
        ));

        bytes32 domainSep = escrow.DOMAIN_SEPARATOR();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(agentKey, digest);
        sig = abi.encodePacked(r, s, v);
    }

    /// Helper: full release flow (register + sign + release)
    function _doRelease(
        uint256 campaignId,
        address clipperAddr,
        uint32 views,
        uint256 nonce
    ) internal returns (uint256 clipId, bytes32 videoHash) {
        (clipId, videoHash) = _registerClip(campaignId, clipperAddr);
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipperAddr, videoHash, views, 8000, 8000, 2000, nonce
        );
        escrow.releaseMilestone(att, sig);
    }
}

contract CampaignEscrowUnitTest is EscrowTestBase {

    // ══════════════════════════════════════════════════════════
    // createCampaign
    // ══════════════════════════════════════════════════════════

    function test_CreateCampaign_HappyPath() public {
        uint256 balBefore = usdt.balanceOf(brand);
        uint256 id = _createCampaign();

        assertEq(id, 1);
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(id);
        assertEq(c.brand, brand);
        assertEq(c.totalBudget, BUDGET);
        assertEq(c.remaining, BUDGET);
        assertEq(c.allocated, 0);
        assertEq(c.cpmRate, CPM);
        assertEq(c.maxPayoutPerClip, CAP);
        assertEq(uint8(c.status), uint8(ICampaignEscrow.CampaignStatus.ACTIVE));
        assertEq(usdt.balanceOf(brand), balBefore - BUDGET);
        assertEq(usdt.balanceOf(address(escrow)), BUDGET);
    }

    function test_CreateCampaign_RevertZeroBudget() public {
        vm.startPrank(brand);
        usdt.approve(address(escrow), 1e18);
        vm.expectRevert(ICampaignEscrow.InvalidBudget.selector);
        escrow.createCampaign(address(usdt), 0, CPM, CAP, MIN_VIEWS,
            uint64(block.timestamp + 14 days), keccak256("s"), keccak256("r"));
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertZeroCpm() public {
        vm.startPrank(brand);
        usdt.approve(address(escrow), BUDGET);
        vm.expectRevert(ICampaignEscrow.InvalidRate.selector);
        escrow.createCampaign(address(usdt), BUDGET, 0, CAP, MIN_VIEWS,
            uint64(block.timestamp + 14 days), keccak256("s"), keccak256("r"));
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertCapExceedsBudget() public {
        vm.startPrank(brand);
        usdt.approve(address(escrow), BUDGET);
        vm.expectRevert(ICampaignEscrow.InvalidCap.selector);
        escrow.createCampaign(address(usdt), BUDGET, CPM, BUDGET + 1, MIN_VIEWS,
            uint64(block.timestamp + 14 days), keccak256("s"), keccak256("r"));
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertDeadlineTooSoon() public {
        vm.startPrank(brand);
        usdt.approve(address(escrow), BUDGET);
        vm.expectRevert(ICampaignEscrow.InvalidDeadline.selector);
        escrow.createCampaign(address(usdt), BUDGET, CPM, CAP, MIN_VIEWS,
            uint64(block.timestamp + 30 minutes), keccak256("s"), keccak256("r"));
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertZeroHash() public {
        vm.startPrank(brand);
        usdt.approve(address(escrow), BUDGET);
        vm.expectRevert(ICampaignEscrow.InvalidHash.selector);
        escrow.createCampaign(address(usdt), BUDGET, CPM, CAP, MIN_VIEWS,
            uint64(block.timestamp + 14 days), bytes32(0), keccak256("r"));
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertTokenNotAllowed() public {
        address fakeToken = makeAddr("fakeToken");
        vm.startPrank(brand);
        vm.expectRevert(ICampaignEscrow.TokenNotAllowed.selector);
        escrow.createCampaign(fakeToken, BUDGET, CPM, CAP, MIN_VIEWS,
            uint64(block.timestamp + 14 days), keccak256("s"), keccak256("r"));
        vm.stopPrank();
    }

    // ══════════════════════════════════════════════════════════
    // registerClip
    // ══════════════════════════════════════════════════════════

    function test_RegisterClip_HappyPath() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        assertEq(clipId, 1);
        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        assertEq(clip.campaignId, campaignId);
        assertEq(clip.clipper, clipper1);
        assertEq(clip.videoIdHash, videoHash);
        assertEq(uint8(clip.status), uint8(ICampaignEscrow.ClipStatus.REGISTERED));
    }

    function test_RegisterClip_RevertDuplicateVideo() public {
        uint256 campaignId = _createCampaign();
        bytes32 videoHash = keccak256("dup");
        vm.startPrank(agentAddr);
        escrow.registerClip(campaignId, clipper1, videoHash);
        vm.expectRevert(ICampaignEscrow.DuplicateVideo.selector);
        escrow.registerClip(campaignId, clipper2, videoHash);
        vm.stopPrank();
    }

    function test_RegisterClip_RevertNotAgent() public {
        uint256 campaignId = _createCampaign();
        vm.prank(brand);
        vm.expectRevert(ICampaignEscrow.NotAgent.selector);
        escrow.registerClip(campaignId, clipper1, keccak256("v"));
    }

    // ══════════════════════════════════════════════════════════
    // releaseMilestone
    // ══════════════════════════════════════════════════════════

    function test_ReleaseMilestone_HappyPath() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );

        uint256 clipperBalBefore = usdt.balanceOf(clipper1);
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        assertEq(clip.paidViews, 5000);
        assertGt(clip.releasedAmount, 0);
        assertGt(clip.holdbackAmount, 0);
        assertEq(uint8(clip.status), uint8(ICampaignEscrow.ClipStatus.ACTIVE));
        assertGt(usdt.balanceOf(clipper1), clipperBalBefore);

        // 70% immediate, 30% holdback
        uint256 gross = (uint256(5000) * uint256(CPM)) / 1000;
        uint128 payable_ = uint128(gross);
        uint128 expectedHoldback = uint128((uint256(payable_) * 3000) / 10000);
        uint128 expectedImmediate = payable_ - expectedHoldback;
        assertEq(clip.releasedAmount, expectedImmediate);
        assertEq(clip.holdbackAmount, expectedHoldback);
    }

    function test_ReleaseMilestone_ElevatedAnomaly() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        // anomaly 5000 bps (>= 4500 threshold) -> elevated holdback 50%
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 5000, 1
        );
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        uint256 gross = (uint256(5000) * uint256(CPM)) / 1000;
        uint128 payable_ = uint128(gross);
        uint128 expectedHoldback = uint128((uint256(payable_) * 5000) / 10000);
        assertEq(clip.holdbackAmount, expectedHoldback);
    }

    function test_ReleaseMilestone_AnomalyFlags() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        // anomaly 7500 bps (>= flag threshold) -> FLAGGED, no funds
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 7500, 1
        );

        uint256 clipperBalBefore = usdt.balanceOf(clipper1);
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        assertEq(uint8(clip.status), uint8(ICampaignEscrow.ClipStatus.FLAGGED));
        assertEq(clip.releasedAmount, 0);
        assertEq(usdt.balanceOf(clipper1), clipperBalBefore);
    }

    function test_ReleaseMilestone_RevertExpiredAttestation() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );

        vm.warp(block.timestamp + 11 minutes);
        vm.expectRevert(ICampaignEscrow.AttestationExpired.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_RevertNoNewViews() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        // First release at 5000 views
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        // Try release at same views -- must revert
        vm.warp(block.timestamp + 31 minutes);
        (att, sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 2
        );
        vm.expectRevert(ICampaignEscrow.NoNewViews.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_RevertTooSoon() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        // Immediately try second release -- must revert (rate limit)
        (att, sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 10000, 8000, 8000, 2000, 2
        );
        vm.expectRevert(ICampaignEscrow.TooSoon.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_RevertLowSourceMatch() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 7100, 8000, 2000, 1
        );
        vm.expectRevert(ICampaignEscrow.SourceMatchTooLow.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_RevertLowSafety() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 6900, 2000, 1
        );
        vm.expectRevert(ICampaignEscrow.SafetyTooLow.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_RevertCampaignExpired() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        vm.warp(block.timestamp + 15 days);
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        vm.expectRevert(ICampaignEscrow.CampaignExpired.selector);
        escrow.releaseMilestone(att, sig);
    }

    function test_ReleaseMilestone_MultiMilestone() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        // Milestone 1: 5000 views
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip1 = escrow.getClip(clipId);

        // Milestone 2: 15000 views (delta = 10000)
        vm.warp(block.timestamp + 31 minutes);
        (att, sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 15000, 8000, 8000, 2000, 2
        );
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clip2 = escrow.getClip(clipId);
        assertGt(clip2.releasedAmount, clip1.releasedAmount);
        assertEq(clip2.paidViews, 15000);
    }

    // ══════════════════════════════════════════════════════════
    // claimHoldback
    // ══════════════════════════════════════════════════════════

    function test_ClaimHoldback_HappyPath() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        ICampaignEscrow.Clip memory clipBefore = escrow.getClip(clipId);
        uint128 holdback = clipBefore.holdbackAmount;
        assertGt(holdback, 0);

        ICampaignEscrow.Campaign memory cBefore = escrow.getCampaign(campaignId);

        // Warp past holdback period
        vm.warp(block.timestamp + 3 days + 1);
        uint256 clipperBalBefore = usdt.balanceOf(clipper1);
        escrow.claimHoldback(clipId);

        ICampaignEscrow.Clip memory clipAfter = escrow.getClip(clipId);
        assertEq(clipAfter.holdbackAmount, 0);
        assertEq(clipAfter.releasedAmount, clipBefore.releasedAmount + holdback);
        assertEq(usdt.balanceOf(clipper1), clipperBalBefore + holdback);

        // allocated must decrease
        ICampaignEscrow.Campaign memory cAfter = escrow.getCampaign(campaignId);
        assertEq(cAfter.allocated, cBefore.allocated - holdback);
    }

    function test_ClaimHoldback_RevertLocked() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        vm.expectRevert(ICampaignEscrow.HoldbackLocked.selector);
        escrow.claimHoldback(clipId);
    }

    function test_ClaimHoldback_RevertFlagged() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        // Brand flags clip
        vm.prank(brand);
        escrow.flagClip(clipId, keccak256("reason"));

        vm.warp(block.timestamp + 3 days + 1);
        vm.expectRevert(ICampaignEscrow.ClipIsFlagged.selector);
        escrow.claimHoldback(clipId);
    }

    // ══════════════════════════════════════════════════════════
    // flagClip
    // ══════════════════════════════════════════════════════════

    function test_FlagClip_HappyPath() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        vm.prank(brand);
        escrow.flagClip(clipId, keccak256("reason"));

        ICampaignEscrow.Clip memory clip = escrow.getClip(clipId);
        assertEq(uint8(clip.status), uint8(ICampaignEscrow.ClipStatus.FLAGGED));
    }

    function test_FlagClip_RevertNotBrand() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        escrow.releaseMilestone(att, sig);

        vm.prank(clipper1);
        vm.expectRevert(ICampaignEscrow.NotBrand.selector);
        escrow.flagClip(clipId, keccak256("reason"));
    }

    // ══════════════════════════════════════════════════════════
    // withdrawRemaining
    // ══════════════════════════════════════════════════════════

    function test_WithdrawRemaining_HappyPath() public {
        uint256 campaignId = _createCampaign();

        // Warp past deadline + grace
        vm.warp(block.timestamp + 14 days + 3 days + 1);
        uint256 brandBalBefore = usdt.balanceOf(brand);

        vm.prank(brand);
        escrow.withdrawRemaining(campaignId);

        assertEq(usdt.balanceOf(brand), brandBalBefore + BUDGET);
        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);
        assertEq(c.remaining, 0);
    }

    function test_WithdrawRemaining_RevertTooEarly() public {
        uint256 campaignId = _createCampaign();
        vm.prank(brand);
        vm.expectRevert(ICampaignEscrow.TooEarly.selector);
        escrow.withdrawRemaining(campaignId);
    }

    function test_WithdrawRemaining_RevertNotBrand() public {
        uint256 campaignId = _createCampaign();
        vm.warp(block.timestamp + 14 days + 3 days + 1);
        vm.prank(clipper1);
        vm.expectRevert(ICampaignEscrow.NotBrand.selector);
        escrow.withdrawRemaining(campaignId);
    }

    // ══════════════════════════════════════════════════════════
    // Governance
    // ══════════════════════════════════════════════════════════

    function test_SetAgent() public {
        address newAgent = makeAddr("newAgent");
        vm.prank(deployer);
        escrow.setAgent(newAgent);
        assertEq(escrow.agent(), newAgent);
    }

    function test_Pause_BlocksRelease() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        vm.prank(deployer);
        escrow.pause();

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 2000, 1
        );
        vm.expectRevert();
        escrow.releaseMilestone(att, sig);
    }

    function test_TopUpCampaign() public {
        uint256 campaignId = _createCampaign();
        uint128 topUp = 10_000_000;

        vm.startPrank(brand);
        usdt.approve(address(escrow), topUp);
        escrow.topUpCampaign(campaignId, topUp);
        vm.stopPrank();

        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);
        assertEq(c.totalBudget, BUDGET + topUp);
        assertEq(c.remaining, BUDGET + topUp);
    }

    // ══════════════════════════════════════════════════════════
    // Native BNB Support Tests
    // ══════════════════════════════════════════════════════════

    function test_CreateCampaign_NativeBNB() public {
        uint128 bnbBudget = 2 ether;
        vm.deal(brand, 10 ether);

        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: bnbBudget}(
            address(0),
            bnbBudget,
            0.01 ether,
            0.5 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );

        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);
        assertEq(c.token, address(0));
        assertEq(c.totalBudget, bnbBudget);
        assertEq(c.remaining, bnbBudget);
        assertEq(address(escrow).balance, bnbBudget);
    }

    function test_CreateCampaign_NativeBNB_RevertMismatchedValue() public {
        uint128 bnbBudget = 2 ether;
        vm.deal(brand, 10 ether);

        vm.prank(brand);
        vm.expectRevert(ICampaignEscrow.InvalidBudget.selector);
        escrow.createCampaign{value: 1 ether}(
            address(0),
            bnbBudget,
            0.01 ether,
            0.5 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );
    }

    function test_TopUpCampaign_NativeBNB() public {
        uint128 bnbBudget = 1 ether;
        vm.deal(brand, 10 ether);

        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: bnbBudget}(
            address(0),
            bnbBudget,
            0.01 ether,
            0.5 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );

        vm.prank(brand);
        escrow.topUpCampaign{value: 0.5 ether}(campaignId, 0.5 ether);

        ICampaignEscrow.Campaign memory c = escrow.getCampaign(campaignId);
        assertEq(c.totalBudget, 1.5 ether);
        assertEq(c.remaining, 1.5 ether);
        assertEq(address(escrow).balance, 1.5 ether);
    }

    function test_ReleaseMilestone_And_Holdback_NativeBNB() public {
        uint128 bnbBudget = 5 ether;
        uint64 bnbCpm = 0.01 ether;
        vm.deal(brand, 10 ether);

        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: bnbBudget}(
            address(0),
            bnbBudget,
            bnbCpm,
            2 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );

        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 10_000, 8500, 8500, 1000, 1
        );

        uint256 clipperBalBefore = clipper1.balance;
        escrow.releaseMilestone(att, sig);

        assertEq(clipper1.balance - clipperBalBefore, 0.07 ether);

        vm.warp(block.timestamp + 3 days + 1);

        escrow.claimHoldback(clipId);
        assertEq(clipper1.balance - clipperBalBefore, 0.1 ether);
    }

    function test_WithdrawRemaining_NativeBNB() public {
        uint128 bnbBudget = 3 ether;
        vm.deal(brand, 10 ether);

        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: bnbBudget}(
            address(0),
            bnbBudget,
            0.01 ether,
            1 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("source"),
            keccak256("rules")
        );

        vm.warp(block.timestamp + 14 days + 3 days + 1);

        uint256 brandBalBefore = brand.balance;
        vm.prank(brand);
        escrow.withdrawRemaining(campaignId);

        assertEq(brand.balance - brandBalBefore, 3 ether);
        assertEq(address(escrow).balance, 0);
    }
}

