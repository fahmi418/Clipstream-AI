export const MIN_SOURCE_MATCH_BPS = 7200;
export const MIN_SAFETY_BPS = 7000;
export const ANOMALY_FLAG_BPS = 7500;
export const ANOMALY_ELEVATED_BPS = 4500;
export const HOLDBACK_NORMAL_BPS = 3000;
export const HOLDBACK_ELEVATED_BPS = 5000;
export const MAX_BPS = 10000;

export const HOLDBACK_PERIOD_SECONDS = 3 * 24 * 3600;
export const HOLDBACK_PERIOD_LONG_SECONDS = 7 * 24 * 3600;
export const MIN_RELEASE_INTERVAL_SECONDS = 1800;
export const REFUND_GRACE_PERIOD_SECONDS = 3 * 24 * 3600;
export const ATTESTATION_EXPIRY_SECONDS = 600;

export const OPBNB_TESTNET_CHAIN_ID = 5611;
export const BSC_TESTNET_CHAIN_ID = 97;

export const ATTESTATION_EIP712_TYPES = {
  Attestation: [
    { name: 'clipId', type: 'uint256' },
    { name: 'campaignId', type: 'uint256' },
    { name: 'clipper', type: 'address' },
    { name: 'videoIdHash', type: 'bytes32' },
    { name: 'verifiedViews', type: 'uint32' },
    { name: 'sourceMatchBps', type: 'uint16' },
    { name: 'safetyBps', type: 'uint16' },
    { name: 'anomalyBps', type: 'uint16' },
    { name: 'evidenceHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint64' },
  ],
} as const;
