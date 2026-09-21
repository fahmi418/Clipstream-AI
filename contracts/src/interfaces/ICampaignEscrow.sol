// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ICampaignEscrow {
    // ── Enums ───────────────────────────────────────────────
    enum CampaignStatus { ACTIVE, ENDED, CANCELLED }
    enum ClipStatus { REGISTERED, ACTIVE, FLAGGED, SETTLED, REJECTED }

    // ── Structs ─────────────────────────────────────────────

    /// Packed into 6 storage slots. See SCHEMA 7.2 for layout.
    struct Campaign {
        address brand;
        uint64 cpmRate;
        CampaignStatus status;
        address token;
        uint64 deadline;
        uint32 minViews;
        uint128 totalBudget;
        uint128 remaining;
        uint128 allocated;
        uint128 maxPayoutPerClip;
        bytes32 sourceHash;
        bytes32 rulesHash;
    }

    /// Packed into 5 storage slots. See SCHEMA 7.3 for layout.
    struct Clip {
        uint256 campaignId;
        address clipper;
        uint32 paidViews;
        uint32 lastReleaseAt;
        ClipStatus status;
        uint128 releasedAmount;
        uint128 holdbackAmount;
        uint64 holdbackUnlockAt;
        bytes32 videoIdHash;
    }

    struct Attestation {
        uint256 clipId;
        uint256 campaignId;
        address clipper;
        bytes32 videoIdHash;
        uint32 verifiedViews;
        uint16 sourceMatchBps;
        uint16 safetyBps;
        uint16 anomalyBps;
        bytes32 evidenceHash;
        uint256 nonce;
        uint64 expiry;
    }

    // ── Events ──────────────────────────────────────────────
    event CampaignCreated(
        uint256 indexed campaignId, address indexed brand, uint128 budget, uint64 cpmRate
    );
    event CampaignToppedUp(uint256 indexed campaignId, uint128 amount);
    event ClipRegistered(
        uint256 indexed clipId, uint256 indexed campaignId, address indexed clipper, bytes32 videoIdHash
    );
    event MilestoneReleased(
        uint256 indexed clipId,
        uint32 fromViews,
        uint32 toViews,
        uint128 released,
        uint128 holdback,
        bytes32 evidenceHash
    );
    event HoldbackClaimed(uint256 indexed clipId, uint128 amount);
    event ClipFlagged(uint256 indexed clipId, address indexed by, bytes32 reasonHash);
    event CampaignRefunded(uint256 indexed campaignId, uint128 amount);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    // ── Custom Errors ───────────────────────────────────────
    error InvalidBudget();
    error InvalidRate();
    error InvalidCap();
    error InvalidDeadline();
    error InvalidHash();
    error TokenNotAllowed();
    error CampaignInactive();
    error CampaignExpired();
    error CampaignMismatch();
    error DuplicateVideo();
    error InvalidClipper();
    error ClipNotFound();
    error ClipperMismatch();
    error VideoMismatch();
    error ClipNotActive();
    error NoNewViews();
    error TooSoon();
    error BelowMinViews();
    error SourceMatchTooLow();
    error SafetyTooLow();
    error NothingToRelease();
    error AttestationExpired();
    error NonceUsed();
    error InvalidSigner();
    error NoHoldback();
    error HoldbackLocked();
    error ClipIsFlagged();
    error NotBrand();
    error NotAgent();
    error TooEarly();
    error NothingToWithdraw();
    error TransferFailed();
    error NativeNotAccepted();
}

