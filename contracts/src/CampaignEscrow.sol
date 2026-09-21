// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ICampaignEscrow } from "./interfaces/ICampaignEscrow.sol";
import { IClipperRegistry } from "./interfaces/IClipperRegistry.sol";
import { AttestationLib } from "./lib/AttestationLib.sol";
import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// Core escrow for the ClipStream protocol.
/// Agent authority is bounded by on-chain invariants I1-I11.
/// See TRD 4.5 for the 17-step release verification flow.
contract CampaignEscrow is ICampaignEscrow, Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using AttestationLib for Attestation;

    // ── Constants (TRD 4.2) ─────────────────────────────────
    uint16 public constant MIN_SOURCE_MATCH_BPS  = 7200;
    uint16 public constant MIN_SAFETY_BPS        = 7000;
    uint16 public constant ANOMALY_FLAG_BPS      = 7500;
    uint16 public constant ANOMALY_ELEVATED_BPS  = 4500;
    uint16 public constant HOLDBACK_NORMAL_BPS   = 3000;
    uint16 public constant HOLDBACK_ELEVATED_BPS = 5000;
    uint64 public constant HOLDBACK_PERIOD       = 3 days;
    uint64 public constant HOLDBACK_PERIOD_LONG  = 7 days;
    uint64 public constant REFUND_GRACE_PERIOD   = 3 days;
    uint64 public constant MIN_RELEASE_INTERVAL  = 30 minutes;
    uint16 public constant MAX_BPS               = 10000;

    // ── State ───────────────────────────────────────────────
    address public agent;
    IClipperRegistry public registry;

    uint256 public nextCampaignId = 1;
    uint256 public nextClipId = 1;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Clip) public clips;
    mapping(uint256 => bool) public usedNonce;
    mapping(bytes32 => bool) public videoRegistered;
    mapping(address => bool) public allowedToken;
    mapping(uint256 => uint128) public withdrawnByBrand;

    bytes32 public immutable DOMAIN_SEPARATOR;

    // ── Constructor ─────────────────────────────────────────

    constructor(
        address initialOwner,
        address agentAddress,
        address registryAddress
    ) Ownable(initialOwner) {
        agent = agentAddress;
        registry = IClipperRegistry(registryAddress);
        DOMAIN_SEPARATOR = AttestationLib.buildDomainSeparator(address(this));
        allowedToken[address(0)] = true;
    }

    // ── Modifiers ───────────────────────────────────────────

    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    // ── Brand Functions ─────────────────────────────────────

    function createCampaign(
        address token,
        uint128 totalBudget,
        uint64 cpmRate,
        uint128 maxPayoutPerClip,
        uint32 minViews,
        uint64 deadline,
        bytes32 sourceHash,
        bytes32 rulesHash
    ) external payable whenNotPaused returns (uint256 campaignId) {
        if (totalBudget == 0) revert InvalidBudget();
        if (cpmRate == 0) revert InvalidRate();
        if (maxPayoutPerClip == 0 || maxPayoutPerClip > totalBudget) revert InvalidCap();
        if (deadline <= uint64(block.timestamp) + 1 hours) revert InvalidDeadline();
        if (sourceHash == bytes32(0) || rulesHash == bytes32(0)) revert InvalidHash();
        if (!allowedToken[token]) revert TokenNotAllowed();

        if (token == address(0)) {
            if (msg.value != totalBudget) revert InvalidBudget();
        } else {
            if (msg.value != 0) revert NativeNotAccepted();
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalBudget);
        }

        campaignId = nextCampaignId++;

        Campaign storage c = campaigns[campaignId];
        c.brand = msg.sender;
        c.cpmRate = cpmRate;
        c.status = CampaignStatus.ACTIVE;
        c.token = token;
        c.deadline = deadline;
        c.minViews = minViews;
        c.totalBudget = totalBudget;
        c.remaining = totalBudget;
        // c.allocated starts at 0
        c.maxPayoutPerClip = maxPayoutPerClip;
        c.sourceHash = sourceHash;
        c.rulesHash = rulesHash;

        emit CampaignCreated(campaignId, msg.sender, totalBudget, cpmRate);
    }

    function topUpCampaign(uint256 campaignId, uint128 amount) external payable whenNotPaused {
        Campaign storage c = campaigns[campaignId];
        if (c.brand != msg.sender) revert NotBrand();
        if (c.status != CampaignStatus.ACTIVE) revert CampaignInactive();
        if (amount == 0) revert InvalidBudget();

        if (c.token == address(0)) {
            if (msg.value != amount) revert InvalidBudget();
        } else {
            if (msg.value != 0) revert NativeNotAccepted();
            IERC20(c.token).safeTransferFrom(msg.sender, address(this), amount);
        }

        c.totalBudget += amount;
        c.remaining += amount;

        emit CampaignToppedUp(campaignId, amount);
    }

    function withdrawRemaining(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.brand != msg.sender) revert NotBrand();
        if (uint64(block.timestamp) <= c.deadline + REFUND_GRACE_PERIOD) revert TooEarly();
        if (c.remaining == 0) revert NothingToWithdraw();

        uint128 refundAmount = c.remaining;
        c.remaining = 0;
        c.status = CampaignStatus.ENDED;
        withdrawnByBrand[campaignId] += refundAmount;

        _transferPayout(c.token, msg.sender, refundAmount);

        emit CampaignRefunded(campaignId, refundAmount);
    }

    function flagClip(uint256 clipId, bytes32 reasonHash) external {
        Clip storage clip = clips[clipId];
        if (clip.clipper == address(0)) revert ClipNotFound();

        Campaign storage c = campaigns[clip.campaignId];
        if (c.brand != msg.sender) revert NotBrand();

        // Can only flag during holdback period
        if (clip.holdbackAmount == 0) revert NoHoldback();
        if (uint64(block.timestamp) >= clip.holdbackUnlockAt) revert HoldbackLocked();
        if (clip.status == ClipStatus.FLAGGED) revert ClipIsFlagged();

        clip.status = ClipStatus.FLAGGED;

        emit ClipFlagged(clipId, msg.sender, reasonHash);
    }

    // ── Agent Functions ─────────────────────────────────────

    function registerClip(
        uint256 campaignId,
        address clipper,
        bytes32 videoIdHash
    ) external onlyAgent whenNotPaused returns (uint256 clipId) {
        Campaign storage c = campaigns[campaignId];
        if (c.status != CampaignStatus.ACTIVE) revert CampaignInactive();
        if (uint64(block.timestamp) > c.deadline) revert CampaignExpired();
        if (videoRegistered[videoIdHash]) revert DuplicateVideo();
        if (clipper == address(0)) revert InvalidClipper();

        videoRegistered[videoIdHash] = true;
        clipId = nextClipId++;

        Clip storage clip = clips[clipId];
        clip.campaignId = campaignId;
        clip.clipper = clipper;
        clip.status = ClipStatus.REGISTERED;
        clip.videoIdHash = videoIdHash;
        // paidViews, releasedAmount, holdbackAmount start at 0

        emit ClipRegistered(clipId, campaignId, clipper, videoIdHash);
    }

    /// TRD 4.5: 17-step verification flow.
    /// Steps are ordered for fail-fast (cheapest checks first).
    function releaseMilestone(
        Attestation calldata att,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        // Step 1: attestation not expired
        if (uint64(block.timestamp) > att.expiry) revert AttestationExpired();

        // Step 2: nonce not used
        if (usedNonce[att.nonce]) revert NonceUsed();

        // Step 3: signature recovery
        address signer = AttestationLib.recoverSigner(att, signature, DOMAIN_SEPARATOR);
        if (signer != agent) revert InvalidSigner();

        // Step 4: clip validation
        Clip storage clip = clips[att.clipId];
        if (clip.clipper == address(0)) revert ClipNotFound();
        if (clip.campaignId != att.campaignId) revert CampaignMismatch();
        if (clip.clipper != att.clipper) revert ClipperMismatch();       // I1
        if (clip.videoIdHash != att.videoIdHash) revert VideoMismatch();
        if (clip.status != ClipStatus.ACTIVE && clip.status != ClipStatus.REGISTERED) {
            revert ClipNotActive();
        }

        // Step 5: views must increase -- I2
        if (att.verifiedViews <= clip.paidViews) revert NoNewViews();

        // Step 6: rate limit per clip -- I11
        if (clip.lastReleaseAt != 0 && uint32(block.timestamp) < clip.lastReleaseAt + uint32(MIN_RELEASE_INTERVAL)) {
            revert TooSoon();
        }

        // Step 7: campaign checks
        Campaign storage c = campaigns[att.campaignId];
        if (c.status != CampaignStatus.ACTIVE) revert CampaignInactive();
        if (uint64(block.timestamp) > c.deadline) revert CampaignExpired();  // I6

        // Step 8: minimum views
        if (att.verifiedViews < c.minViews) revert BelowMinViews();

        // Step 9: score thresholds -- I8
        if (att.sourceMatchBps < MIN_SOURCE_MATCH_BPS) revert SourceMatchTooLow();
        if (att.safetyBps < MIN_SAFETY_BPS) revert SafetyTooLow();

        // Step 10: anomaly flag -- no funds released
        if (att.anomalyBps >= ANOMALY_FLAG_BPS) {
            clip.status = ClipStatus.FLAGGED;
            usedNonce[att.nonce] = true;
            emit ClipFlagged(att.clipId, agent, att.evidenceHash);
            return;
        }

        // Step 11: compute payout
        (uint128 payable_, uint128 immediate, uint128 holdback, uint64 unlockAt) =
            _computePayout(c, clip, att);

        // Step 12: must release something
        if (payable_ == 0) revert NothingToRelease();

        // Step 13: mark nonce used -- I5
        usedNonce[att.nonce] = true;

        // Capture before mutation -- needed for event and registry
        uint32 fromViews = clip.paidViews;

        // Step 14: update state BEFORE transfer (checks-effects-interactions)
        clip.paidViews = att.verifiedViews;
        clip.lastReleaseAt = uint32(block.timestamp);
        clip.releasedAmount += immediate;
        clip.holdbackAmount += holdback;
        clip.holdbackUnlockAt = unlockAt;
        clip.status = ClipStatus.ACTIVE;

        c.remaining -= payable_;
        c.allocated += holdback;

        // Step 15: transfer immediate portion to clipper
        _transferPayout(c.token, clip.clipper, immediate);

        // Step 16: record in registry
        registry.recordPayout(clip.clipper, att.campaignId, immediate + holdback, att.verifiedViews);

        // Step 17: emit event
        emit MilestoneReleased(
            att.clipId,
            fromViews,
            att.verifiedViews,
            immediate,
            holdback,
            att.evidenceHash
        );
    }

    /// Permissionless: anyone can call, funds always go to clip.clipper.
    /// Clipper can claim even if backend is down.
    function claimHoldback(uint256 clipId) external nonReentrant {
        Clip storage clip = clips[clipId];
        if (clip.holdbackAmount == 0) revert NoHoldback();
        if (uint64(block.timestamp) < clip.holdbackUnlockAt) revert HoldbackLocked();
        if (clip.status == ClipStatus.FLAGGED) revert ClipIsFlagged();

        uint128 amount = clip.holdbackAmount;
        Campaign storage c = campaigns[clip.campaignId];

        // Update state before transfer
        clip.holdbackAmount = 0;
        clip.releasedAmount += amount;
        c.allocated -= amount;

        _transferPayout(c.token, clip.clipper, amount);

        emit HoldbackClaimed(clipId, amount);
    }

    /// Agent can flag a clip outside the release flow.
    function flagAnomaly(uint256 clipId, bytes32 evidenceHash) external onlyAgent {
        Clip storage clip = clips[clipId];
        if (clip.clipper == address(0)) revert ClipNotFound();
        if (clip.status == ClipStatus.FLAGGED) revert ClipIsFlagged();

        clip.status = ClipStatus.FLAGGED;

        emit ClipFlagged(clipId, msg.sender, evidenceHash);
    }

    // ── Governance ──────────────────────────────────────────

    function setAgent(address newAgent) external onlyOwner {
        if (newAgent == address(0)) revert InvalidSigner();
        address oldAgent = agent;
        agent = newAgent;
        emit AgentUpdated(oldAgent, newAgent);
    }


    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setTokenAllowed(address token, bool allowed) external onlyOwner {
        allowedToken[token] = allowed;
    }

    // ── Internal ────────────────────────────────────────────

    /// Payout computation per TRD 4.6.
    /// Rounding always favors the protocol (remainder stays in `remaining`,
    /// eventually refunded to brand). This prevents total payouts from
    /// exceeding totalBudget due to rounding up.
    function _computePayout(
        Campaign storage c,
        Clip storage clip,
        Attestation calldata att
    )
        internal
        view
        returns (uint128 payable_, uint128 immediate, uint128 holdback, uint64 unlockAt)
    {
        uint256 newViews = uint256(att.verifiedViews) - uint256(clip.paidViews);
        uint256 gross = (newViews * uint256(c.cpmRate)) / 1000;

        // Cap per clip -- I3
        uint256 clipRoom = uint256(c.maxPayoutPerClip)
            - uint256(clip.releasedAmount)
            - uint256(clip.holdbackAmount);
        uint256 capped = gross > clipRoom ? clipRoom : gross;

        // Cap budget -- I4
        payable_ = uint128(capped > uint256(c.remaining) ? c.remaining : capped);

        bool elevated = att.anomalyBps >= ANOMALY_ELEVATED_BPS;
        uint16 bps = elevated ? HOLDBACK_ELEVATED_BPS : HOLDBACK_NORMAL_BPS;

        holdback = uint128((uint256(payable_) * bps) / MAX_BPS);
        immediate = payable_ - holdback;
        unlockAt = uint64(block.timestamp) + (elevated ? HOLDBACK_PERIOD_LONG : HOLDBACK_PERIOD);
    }

    receive() external payable {
        revert NativeNotAccepted();
    }

    function _transferPayout(address token, address to, uint256 amount) internal {
        if (amount == 0) return;
        if (token == address(0)) {
            (bool sent, ) = payable(to).call{value: amount}("");
            if (!sent) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    // ── View Functions ──────────────────────────────────────

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getClip(uint256 clipId) external view returns (Clip memory) {
        return clips[clipId];
    }
}

