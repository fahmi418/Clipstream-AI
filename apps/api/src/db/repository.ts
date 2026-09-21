import type {
  CampaignRecord,
  ClipRecord,
  SourceVideoRecord,
  StageResult,
  Attestation,
  EvidenceBundle,
} from '@clipstream/shared';

export interface UserEntity {
  id: string;
  privyDid: string;
  walletAddress: string;
  displayName: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignEntity {
  id: string;
  onchainId: bigint | null;
  brandId: string;
  sourceVideoId: string;
  title: string;
  rules: string;
  tokenAddress: string;
  cpmRate: bigint;
  totalBudget: bigint;
  maxPayoutPerClip: bigint;
  minViews: number;
  deadline: Date;
  sourceHash: `0x${string}`;
  rulesHash: `0x${string}`;
  status: 'DRAFT' | 'PREPROCESSING' | 'READY' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  createTxHash: string | null;
  createdAt: Date;
  activatedAt: Date | null;
}

export interface SourceVideoEntity {
  id: string;
  platform: string;
  videoId: string;
  videoIdHash: `0x${string}`;
  title: string;
  durationSec: number;
  transcript: string | null;
  transcriptHash: `0x${string}` | null;
  transcriptStatus: string;
  createdAt: Date;
}

export interface SourceChunkEntity {
  id: string;
  sourceVideoId: string;
  chunkIndex: number;
  startSec: number;
  endSec: number;
  chunkText: string;
  embedding?: number[];
  createdAt: Date;
}

export interface CampaignParticipantEntity {
  id: string;
  campaignId: string;
  userId: string;
  verificationCode: string;
  joinedAt: Date;
}

export interface ClipEntity {
  id: string;
  onchainId: bigint | null;
  campaignId: string;
  clipperId: string;
  platform: string;
  videoId: string;
  videoIdHash: `0x${string}`;
  url: string;
  verificationCode: string;
  publishedAt: Date | null;
  durationSec: number | null;
  transcript: string | null;
  transcriptHash: `0x${string}` | null;
  paidViews: number;
  releasedAmount: bigint;
  holdbackAmount: bigint;
  holdbackUnlockAt: Date | null;
  status:
    | 'SUBMITTED'
    | 'VERIFYING'
    | 'PENDING_VIEWS'
    | 'NEEDS_REVIEW'
    | 'ACTIVE'
    | 'FLAGGED'
    | 'SETTLED'
    | 'REJECTED';
  rejectionCode: string | null;
  rejectionReason: string | null;
  registerTxHash: string | null;
  submittedAt: Date;
  lastVerifiedAt: Date | null;
  nextCheckAt: Date | null;
}

export interface VerificationRunEntity {
  id: string;
  clipId: string;
  attempt: number;
  traceId: string;
  outcome: string | null;
  durationMs: number | null;
  startedAt: Date;
  finishedAt: Date | null;
}

export interface StageResultEntity {
  id: string;
  runId: string;
  stage: string;
  stageOrder: number;
  status: 'PASS' | 'FAIL' | 'REVIEW' | 'DEFER' | 'ERROR';
  score: number | null;
  data: Record<string, unknown>;
  reason: string | null;
  durationMs: number;
  modelVersion: string | null;
  createdAt: Date;
}

export interface AttestationEntity {
  id: string;
  clipId: string;
  runId: string | null;
  nonce: bigint;
  verifiedViews: number;
  sourceMatchBps: number;
  safetyBps: number;
  anomalyBps: number;
  evidenceHash: `0x${string}`;
  ipfsCid: string | null;
  expiry: Date;
  signature: string;
  signerAddress: string;
  txHash: string | null;
  txStatus: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVERTED';
  gasUsed: bigint | null;
  blockNumber: bigint | null;
  releasedAmount: bigint | null;
  holdbackAmount: bigint | null;
  createdAt: Date;
  confirmedAt: Date | null;
}

export interface EvidenceBundleEntity {
  id: string;
  attestationId: string;
  payload: EvidenceBundle;
  payloadHash: `0x${string}`;
  ipfsCid: string | null;
  ipfsStatus: string;
  createdAt: Date;
}

export interface MetricSnapshotEntity {
  id: string;
  clipId: string;
  views: number;
  likes: number;
  comments: number;
  capturedAt: Date;
}

export interface AppealEntity {
  id: string;
  clipId: string;
  clipperId: string;
  reason: string;
  status: 'PENDING' | 'UPHELD' | 'REJECTED';
  reviewNotes: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface IDatabaseRepository {
  // Users
  getUserById(id: string): Promise<UserEntity | null>;
  getUserByPrivyDid(privyDid: string): Promise<UserEntity | null>;
  getUserByWallet(address: string): Promise<UserEntity | null>;
  upsertUser(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;

  // Source Videos & Chunks
  createSourceVideo(
    video: Omit<SourceVideoEntity, 'id' | 'createdAt'>
  ): Promise<SourceVideoEntity>;
  getSourceVideoById(id: string): Promise<SourceVideoEntity | null>;
  getSourceVideoByHash(hash: `0x${string}`): Promise<SourceVideoEntity | null>;
  insertSourceChunks(
    chunks: Array<Omit<SourceChunkEntity, 'id' | 'createdAt'>>
  ): Promise<SourceChunkEntity[]>;
  getSourceChunks(sourceVideoId: string): Promise<SourceChunkEntity[]>;

  // Campaigns
  createCampaign(campaign: Omit<CampaignEntity, 'id' | 'createdAt'>): Promise<CampaignEntity>;
  getCampaignById(id: string): Promise<CampaignEntity | null>;
  getCampaignByOnchainId(onchainId: bigint): Promise<CampaignEntity | null>;
  listCampaigns(filter?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<CampaignEntity[]>;
  updateCampaignStatus(
    id: string,
    status: CampaignEntity['status'],
    onchainId?: bigint
  ): Promise<void>;

  // Campaign Participants
  joinCampaign(
    campaignId: string,
    userId: string,
    verificationCode: string
  ): Promise<CampaignParticipantEntity>;
  getParticipant(
    campaignId: string,
    userId: string
  ): Promise<CampaignParticipantEntity | null>;
  countParticipants(campaignId: string): Promise<number>;

  // Clips
  createClip(clip: Omit<ClipEntity, 'id' | 'submittedAt'>): Promise<ClipEntity>;
  getClipById(id: string): Promise<ClipEntity | null>;
  getClipByVideoHash(hash: `0x${string}`): Promise<ClipEntity | null>;
  listClipsByCampaign(campaignId: string): Promise<ClipEntity[]>;
  listClipsByClipper(clipperId: string): Promise<ClipEntity[]>;
  countClipsByCampaign(campaignId: string): Promise<number>;
  updateClip(id: string, updates: Partial<ClipEntity>): Promise<ClipEntity>;
  listClipsDueForMetrics(now: Date, limit?: number): Promise<ClipEntity[]>;
  listClipsDueForHoldback(now: Date, limit?: number): Promise<ClipEntity[]>;

  // Verification Runs & Stage Results
  createVerificationRun(
    clipId: string,
    traceId: string,
    attempt?: number
  ): Promise<VerificationRunEntity>;
  completeVerificationRun(
    id: string,
    outcome: string,
    durationMs: number
  ): Promise<void>;
  listRunsByClipId(clipId: string): Promise<VerificationRunEntity[]>;
  insertStageResult(
    result: Omit<StageResultEntity, 'id' | 'createdAt'>
  ): Promise<StageResultEntity>;
  listStageResultsByRun(runId: string): Promise<StageResultEntity[]>;

  // Attestations & Evidence
  createAttestation(
    attestation: Omit<AttestationEntity, 'id' | 'createdAt'>
  ): Promise<AttestationEntity>;
  getAttestationById(id: string): Promise<AttestationEntity | null>;
  listAttestationsByClip(clipId: string): Promise<AttestationEntity[]>;
  updateAttestationTx(
    id: string,
    txHash: string,
    status: AttestationEntity['txStatus'],
    blockNumber?: bigint,
    gasUsed?: bigint
  ): Promise<void>;
  getNextNonce(): Promise<bigint>;
  createEvidenceBundle(
    bundle: Omit<EvidenceBundleEntity, 'id' | 'createdAt'>
  ): Promise<EvidenceBundleEntity>;
  getEvidenceBundleByAttestation(
    attestationId: string
  ): Promise<EvidenceBundleEntity | null>;

  // Metric Snapshots
  recordMetricSnapshot(
    snapshot: Omit<MetricSnapshotEntity, 'id' | 'capturedAt'>
  ): Promise<MetricSnapshotEntity>;
  getMetricSnapshots(clipId: string): Promise<MetricSnapshotEntity[]>;

  // Appeals
  createAppeal(
    appeal: Omit<AppealEntity, 'id' | 'createdAt' | 'resolvedAt'>
  ): Promise<AppealEntity>;
  getAppealsByClip(clipId: string): Promise<AppealEntity[]>;
}
