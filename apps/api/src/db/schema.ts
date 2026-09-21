import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  smallint,
  bigint,
  numeric,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// Enums
export const campaignStatusEnum = pgEnum('campaign_status', [
  'DRAFT',
  'PREPROCESSING',
  'READY',
  'ACTIVE',
  'ENDED',
  'CANCELLED',
]);

export const clipStatusEnum = pgEnum('clip_status', [
  'SUBMITTED',
  'VERIFYING',
  'PENDING_VIEWS',
  'NEEDS_REVIEW',
  'ACTIVE',
  'FLAGGED',
  'SETTLED',
  'REJECTED',
]);

export const stageStatusEnum = pgEnum('stage_status', [
  'PASS',
  'FAIL',
  'REVIEW',
  'DEFER',
  'ERROR',
]);

export const txStatusEnum = pgEnum('tx_status', [
  'PENDING',
  'CONFIRMED',
  'FAILED',
  'REVERTED',
]);

export const appealStatusEnum = pgEnum('appeal_status', [
  'PENDING',
  'UPHELD',
  'REJECTED',
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  privyDid: text('privy_did').notNull().unique(),
  walletAddress: text('wallet_address').notNull().unique(),
  displayName: text('display_name'),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sourceVideos = pgTable('source_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(),
  videoId: text('video_id').notNull(),
  videoIdHash: text('video_id_hash').notNull().unique(),
  title: text('title').notNull(),
  durationSec: integer('duration_sec').notNull(),
  transcript: text('transcript'),
  transcriptHash: text('transcript_hash'),
  transcriptStatus: text('transcript_status').notNull().default('READY'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sourceChunks = pgTable('source_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceVideoId: uuid('source_video_id')
    .notNull()
    .references(() => sourceVideos.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  startSec: numeric('start_sec', { precision: 8, scale: 2 }).notNull(),
  endSec: numeric('end_sec', { precision: 8, scale: 2 }).notNull(),
  chunkText: text('chunk_text').notNull(),
  embedding: jsonb('embedding'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    onchainId: bigint('onchain_id', { mode: 'bigint' }).unique(),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => users.id),
    sourceVideoId: uuid('source_video_id')
      .notNull()
      .references(() => sourceVideos.id),
    title: text('title').notNull(),
    rules: text('rules').notNull(),
    tokenAddress: text('token_address').notNull(),
    cpmRate: numeric('cpm_rate', { precision: 78, scale: 0 }).notNull(),
    totalBudget: numeric('total_budget', { precision: 78, scale: 0 }).notNull(),
    maxPayoutPerClip: numeric('max_payout_per_clip', { precision: 78, scale: 0 }).notNull(),
    minViews: integer('min_views').notNull().default(1000),
    deadline: timestamp('deadline', { withTimezone: true }).notNull(),
    sourceHash: text('source_hash').notNull(),
    rulesHash: text('rules_hash').notNull(),
    status: campaignStatusEnum('status').notNull().default('DRAFT'),
    createTxHash: text('create_tx_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
  },
  (table) => ({
    statusDeadlineIdx: index('idx_campaigns_status_deadline').on(table.status, table.deadline),
    brandIdx: index('idx_campaigns_brand').on(table.brandId, table.createdAt),
    onchainIdx: index('idx_campaigns_onchain').on(table.onchainId),
  })
);

export const campaignParticipants = pgTable(
  'campaign_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    verificationCode: text('verification_code').notNull().unique(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueJoin: unique('cp_unique_join').on(table.campaignId, table.userId),
  })
);

export const clips = pgTable(
  'clips',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    onchainId: bigint('onchain_id', { mode: 'bigint' }).unique(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    clipperId: uuid('clipper_id')
      .notNull()
      .references(() => users.id),
    platform: text('platform').notNull(),
    videoId: text('video_id').notNull(),
    videoIdHash: text('video_id_hash').notNull().unique(),
    url: text('url').notNull(),
    verificationCode: text('verification_code').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    durationSec: integer('duration_sec'),
    transcript: text('transcript'),
    transcriptHash: text('transcript_hash'),
    paidViews: integer('paid_views').notNull().default(0),
    releasedAmount: numeric('released_amount', { precision: 78, scale: 0 }).notNull().default('0'),
    holdbackAmount: numeric('holdback_amount', { precision: 78, scale: 0 }).notNull().default('0'),
    holdbackUnlockAt: timestamp('holdback_unlock_at', { withTimezone: true }),
    status: clipStatusEnum('status').notNull().default('SUBMITTED'),
    rejectionCode: text('rejection_code'),
    rejectionReason: text('rejection_reason'),
    registerTxHash: text('register_tx_hash'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    nextCheckAt: timestamp('next_check_at', { withTimezone: true }),
  },
  (table) => ({
    campaignStatusIdx: index('idx_clips_campaign_status').on(table.campaignId, table.status),
    clipperIdx: index('idx_clips_clipper').on(table.clipperId, table.submittedAt),
    uniqueVideo: unique('clip_unique_video').on(table.platform, table.videoId),
  })
);

export const verificationRuns = pgTable(
  'verification_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clipId: uuid('clip_id')
      .notNull()
      .references(() => clips.id, { onDelete: 'cascade' }),
    attempt: integer('attempt').notNull().default(1),
    traceId: text('trace_id').notNull(),
    outcome: text('outcome'),
    durationMs: integer('duration_ms'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (table) => ({
    uniqueAttempt: unique('vr_unique_attempt').on(table.clipId, table.attempt),
    clipTimeIdx: index('idx_runs_clip').on(table.clipId, table.startedAt),
  })
);

export const stageResults = pgTable(
  'stage_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id')
      .notNull()
      .references(() => verificationRuns.id, { onDelete: 'cascade' }),
    stage: text('stage').notNull(),
    stageOrder: smallint('stage_order').notNull(),
    status: stageStatusEnum('status').notNull(),
    score: numeric('score', { precision: 5, scale: 4 }),
    data: jsonb('data').notNull().default({}),
    reason: text('reason'),
    durationMs: integer('duration_ms').notNull(),
    modelVersion: text('model_version'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueStage: unique('sr_unique_stage').on(table.runId, table.stage),
    runOrderIdx: index('idx_stage_results_run').on(table.runId, table.stageOrder),
  })
);

export const attestations = pgTable(
  'attestations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clipId: uuid('clip_id')
      .notNull()
      .references(() => clips.id),
    runId: uuid('run_id').references(() => verificationRuns.id),
    nonce: bigint('nonce', { mode: 'bigint' }).notNull().unique(),
    verifiedViews: integer('verified_views').notNull(),
    sourceMatchBps: smallint('source_match_bps').notNull(),
    safetyBps: smallint('safety_bps').notNull(),
    anomalyBps: smallint('anomaly_bps').notNull(),
    evidenceHash: text('evidence_hash').notNull(),
    ipfsCid: text('ipfs_cid'),
    expiry: timestamp('expiry', { withTimezone: true }).notNull(),
    signature: text('signature').notNull(),
    signerAddress: text('signer_address').notNull(),
    txHash: text('tx_hash'),
    txStatus: txStatusEnum('tx_status').notNull().default('PENDING'),
    gasUsed: bigint('gas_used', { mode: 'bigint' }),
    blockNumber: bigint('block_number', { mode: 'bigint' }),
    releasedAmount: numeric('released_amount', { precision: 78, scale: 0 }),
    holdbackAmount: numeric('holdback_amount', { precision: 78, scale: 0 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  },
  (table) => ({
    clipIdx: index('idx_attestations_clip').on(table.clipId, table.createdAt),
    txIdx: index('idx_attestations_tx').on(table.txHash),
  })
);

export const evidenceBundles = pgTable('evidence_bundles', {
  id: uuid('id').primaryKey().defaultRandom(),
  attestationId: uuid('attestation_id')
    .notNull()
    .unique()
    .references(() => attestations.id, { onDelete: 'cascade' }),
  payload: jsonb('payload').notNull(),
  payloadHash: text('payload_hash').notNull(),
  ipfsCid: text('ipfs_cid'),
  ipfsStatus: text('ipfs_status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const metricSnapshots = pgTable(
  'metric_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clipId: uuid('clip_id')
      .notNull()
      .references(() => clips.id, { onDelete: 'cascade' }),
    views: integer('views').notNull(),
    likes: integer('likes').notNull().default(0),
    comments: integer('comments').notNull().default(0),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clipTimeIdx: index('idx_metric_snapshots_clip_time').on(table.clipId, table.capturedAt),
  })
);

export const appeals = pgTable('appeals', {
  id: uuid('id').primaryKey().defaultRandom(),
  clipId: uuid('clip_id')
    .notNull()
    .references(() => clips.id),
  clipperId: uuid('clipper_id')
    .notNull()
    .references(() => users.id),
  reason: text('reason').notNull(),
  status: appealStatusEnum('status').notNull().default('PENDING'),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});
