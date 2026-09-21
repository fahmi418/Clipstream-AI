// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { EscrowTestBase } from "../unit/CampaignEscrow.t.sol";
import { ICampaignEscrow } from "../../src/interfaces/ICampaignEscrow.sol";
import { CampaignEscrow } from "../../src/CampaignEscrow.sol";

/// Malicious contract that tries to re-enter CampaignEscrow during receive()
contract MaliciousReentrantClipper {
    ICampaignEscrow public escrow;
    uint256 public attackClipId;
    bool public attacked;

    constructor(address escrowAddr) {
        escrow = ICampaignEscrow(escrowAddr);
    }

    function setAttackClipId(uint256 clipId) external {
        attackClipId = clipId;
    }

    receive() external payable {
        if (!attacked && attackClipId != 0) {
            attacked = true;
            // Attempt to re-enter claimHoldback
            CampaignEscrow(payable(address(escrow))).claimHoldback(attackClipId);
        }
    }
}

contract AttackScenariosTest is EscrowTestBase {
    // ── Attack 1: Front-running and Attestation Tampering ────────
    function testAttack_TamperClipperAddress() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        address attacker = makeAddr("attacker");

        // Attacker intercepts attestation and changes clipper to attacker address
        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 1000, 1
        );
        att.clipper = attacker;

        // Signature becomes invalid for tampered struct
        vm.expectRevert(ICampaignEscrow.InvalidSigner.selector);
        escrow.releaseMilestone(att, sig);
    }

    // ── Attack 2: Replay Attestation (Reused Nonce) ─────────────
    function testAttack_ReplayAttestation() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, clipper1, videoHash, 5000, 8000, 8000, 1000, 42
        );

        escrow.releaseMilestone(att, sig);

        // Attacker attempts to replay the same transaction
        vm.expectRevert(ICampaignEscrow.NonceUsed.selector);
        escrow.releaseMilestone(att, sig);
    }

    // ── Attack 3: Unauthorized Signer Forgery ───────────────────
    function testAttack_UnauthorizedSigner() public {
        uint256 campaignId = _createCampaign();
        (uint256 clipId, bytes32 videoHash) = _registerClip(campaignId, clipper1);

        (, uint256 fakeKey) = makeAddrAndKey("fakeAgent");

        ICampaignEscrow.Attestation memory att = ICampaignEscrow.Attestation({
            clipId: clipId,
            campaignId: campaignId,
            clipper: clipper1,
            videoIdHash: videoHash,
            verifiedViews: 5000,
            sourceMatchBps: 8000,
            safetyBps: 8000,
            anomalyBps: 1000,
            evidenceHash: keccak256("fakeEvidence"),
            nonce: 777,
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(fakeKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.expectRevert(ICampaignEscrow.InvalidSigner.selector);
        escrow.releaseMilestone(att, sig);
    }

    // ── Attack 4: Duplicate Video Sybil Attack ───────────────────
    function testAttack_DuplicateVideoRegistration() public {
        uint256 campaignId = _createCampaign();
        bytes32 commonVideoHash = keccak256("same-youtube-short-123");

        vm.prank(agentAddr);
        escrow.registerClip(campaignId, clipper1, commonVideoHash);

        // Sybil attacker attempts to register the same video hash under clipper2
        vm.prank(agentAddr);
        vm.expectRevert(ICampaignEscrow.DuplicateVideo.selector);
        escrow.registerClip(campaignId, clipper2, commonVideoHash);
    }

    // ── Attack 5: Premature Brand Drain / Rugpull ───────────────
    function testAttack_PrematureBrandRefund() public {
        uint256 campaignId = _createCampaign();
        _registerClip(campaignId, clipper1);

        // Try to refund before deadline
        vm.prank(brand);
        vm.expectRevert(ICampaignEscrow.TooEarly.selector);
        escrow.withdrawRemaining(campaignId);

        // Try to refund right at deadline (still in 3-day refund grace period)
        vm.warp(block.timestamp + 14 days);
        vm.prank(brand);
        vm.expectRevert(ICampaignEscrow.TooEarly.selector);
        escrow.withdrawRemaining(campaignId);
    }

    // ── Attack 6: Reentrancy Attack via Native BNB ──────────────
    function testAttack_ReentrancyBlocked() public {
        MaliciousReentrantClipper reentrant = new MaliciousReentrantClipper(address(escrow));

        uint128 bnbBudget = 5 ether;
        vm.deal(brand, 10 ether);
        vm.prank(brand);
        uint256 campaignId = escrow.createCampaign{value: bnbBudget}(
            address(0),
            bnbBudget,
            0.01 ether,
            2 ether,
            100,
            uint64(block.timestamp + 14 days),
            keccak256("src"),
            keccak256("rls")
        );

        bytes32 vHash = keccak256("reentrantVideo");
        vm.prank(agentAddr);
        uint256 clipId = escrow.registerClip(campaignId, address(reentrant), vHash);

        reentrant.setAttackClipId(clipId);

        (ICampaignEscrow.Attestation memory att, bytes memory sig) = _signAttestation(
            clipId, campaignId, address(reentrant), vHash, 10_000, 8500, 8500, 1000, 123
        );

        // The reentrant attack during immediate BNB transfer is blocked by ReentrancyGuard
        // claimHoldback has nonReentrant modifier
        vm.expectRevert();
        escrow.releaseMilestone(att, sig);
    }

    // ── Attack 7: Plain Ether Send Rejected ─────────────────────
    function testAttack_DirectEtherSendReverts() public {
        vm.deal(clipper1, 1 ether);
        vm.prank(clipper1);
        (bool success, ) = address(escrow).call{value: 0.5 ether}("");
        assertFalse(success);
    }
}
