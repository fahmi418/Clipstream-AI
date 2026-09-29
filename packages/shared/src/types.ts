export type StageStatus = 'PASS' | 'FAIL' | 'REVIEW' | 'DEFER' | 'ERROR';

export interface StageResult<T = unknown> {
  stage: string;
  status: StageStatus;
  score?: number; // 0.0 - 1.0
  data: T;
  reason?: string; // Indonesian message for clipper
  durationMs: number;
  modelVersion?: string;
}

export interface CampaignRecord {
  id: string;
  onchainId: bigint;
  brandId: string;
  sourceVideoId: string;
  title: string;
  description?: string;
  rules: string;
  cpmRate: bigint;
  totalBudget: bigint;
  maxPayoutPerClip: bigint;
  minViews: number;
  deadline: Date;
  sourceHash: `0x${string}`;
  rulesHash: `0x${string}`;
  tokenAddress: `0x${string}`;
  createdAt: Date;
}

export interface ClipRecord {
  id: string;
  onchainId?: bigint;
  campaignId: string;
  clipperId: string;
  clipperAddress: `0x${string}`;
  videoId: string;
  videoIdHash: `0x${string}`;
  platform: 'youtube';
  paidViews: number;
  releasedAmount: bigint;
  holdbackAmount: bigint;
  status: 'REGISTERED' | 'ACTIVE' | 'FLAGGED' | 'SETTLED' | 'REJECTED';
}

export interface SourceVideoRecord {
  id: string;
  platform: 'youtube';
  videoId: string;
  videoIdHash: `0x${string}`;
  title: string;
  durationSec: number;
  transcript: string;
  transcriptHash: `0x${string}`;
  sourceChunks?: Array<{
    idx: number;
    text: string;
    embedding: number[];
    startSec: number;
    endSec: number;
  }>;
}

export interface PipelineContext {
  clipId: string;
  campaign: CampaignRecord;
  sourceVideo: SourceVideoRecord;
  clip: ClipRecord;
  results: Map<string, StageResult>;
}

export interface AttestationMessage {
  clipId: bigint;
  campaignId: bigint;
  clipper: `0x${string}`;
  videoIdHash: `0x${string}`;
  verifiedViews: number;
  sourceMatchBps: number;
  safetyBps: number;
  anomalyBps: number;
  evidenceHash: `0x${string}`;
  nonce: bigint;
  expiry: bigint;
}

export type Attestation = AttestationMessage;

export type ClipStatus =
  | 'SUBMITTED'
  | 'VERIFYING'
  | 'PENDING_VIEWS'
  | 'NEEDS_REVIEW'
  | 'ACTIVE'
  | 'FLAGGED'
  | 'SETTLED'
  | 'REJECTED';

export interface EvidenceBundle {
  version: '1.0';
  clipId: string;
  campaignId: number;
  clipper: `0x${string}`;
  videoIdHash: `0x${string}`;
  verifiedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    durationSec: number;
    fetchedAt: string;
  };
  stages: {
    ownership: {
      verified: boolean;
      codeFound: string | null;
      publishedAt: string;
    };
    sourceMatch: {
      score: number;
      coverage: number;
      contiguity: number;
      matchedChunkCount: number;
      clipChunkCount: number;
      sourceSpan: { startSec: number; endSec: number } | null;
    };
    brandSafety: {
      score: number;
      safe: boolean;
      violations: Array<{
        rule: string;
        severity: 'low' | 'medium' | 'high';
        evidence: string;
      }>;
      reasoning: string;
    };
    anomaly: {
      score: number;
      signals: {
        engagementRatio: { raw: number; normalized: number };
        velocityZScore: { raw: number; normalized: number };
        likeCommentRatio: { raw: number; normalized: number };
        accountHistory: { raw: number; normalized: number };
      };
      note: string;
    };
  };
  scores: {
    sourceMatchBps: number;
    safetyBps: number;
    anomalyBps: number;
  };
  modelVersions: {
    asr: string;
    embedding: string;
    safety: string;
  };
  transcriptHash: `0x${string}`;
  financials?: {
    grossPayout?: string;
    platformFeeAmount?: string;
    platformFeeBps?: number;
    netPayout?: string;
    immediateAmount?: string;
    holdbackAmount?: string;
  };
}

// Float score to Basis Points (0 - 10000).
// Must use Math.round to avoid 0.7199999 float truncation bug (SCHEMA §8.3).
export function toBps(score: number): number {
  return Math.max(0, Math.min(10000, Math.round(score * 10000)));
}
