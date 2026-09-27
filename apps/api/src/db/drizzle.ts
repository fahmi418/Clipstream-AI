import { eq, and, sql, desc, asc, lte } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import type {
  IDatabaseRepository,
  UserEntity,
  UserRole,
  CampaignEntity,
  SourceVideoEntity,
  SourceChunkEntity,
  CampaignParticipantEntity,
  ClipEntity,
  VerificationRunEntity,
  StageResultEntity,
  AttestationEntity,
  EvidenceBundleEntity,
  MetricSnapshotEntity,
  AppealEntity,
} from './repository.js';
import type { EvidenceBundle } from '@clipstream/shared';

export class DrizzleDatabaseRepository implements IDatabaseRepository {
  public readonly db: PostgresJsDatabase<typeof schema>;
  private readonly sqlClient: postgres.Sql;

  constructor(databaseUrl: string) {
    this.sqlClient = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    this.db = drizzle(this.sqlClient, { schema });
  }

  // Users
  async getUserById(id: string): Promise<UserEntity | null> {
    const records = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return records[0] ? this.mapUser(records[0]) : null;
  }

  async getUserByPrivyDid(privyDid: string): Promise<UserEntity | null> {
    const records = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.privyDid, privyDid))
      .limit(1);
    return records[0] ? this.mapUser(records[0]) : null;
  }

  async getUserByWallet(address: string): Promise<UserEntity | null> {
    const records = await this.db
      .select()
      .from(schema.users)
      .where(eq(sql`LOWER(${schema.users.walletAddress})`, address.toLowerCase()))
      .limit(1);
    return records[0] ? this.mapUser(records[0]) : null;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const records = await this.db
      .select()
      .from(schema.users)
      .where(eq(sql`LOWER(${schema.users.email})`, email.toLowerCase().trim()))
      .limit(1);
    return records[0] ? this.mapUser(records[0]) : null;
  }

  async createUser(
    userData: Partial<UserEntity> & { role: 'CLIPPER' | 'BRAND' | 'ADMIN' }
  ): Promise<UserEntity> {
    const records = await this.db
      .insert(schema.users)
      .values({
        privyDid: userData.privyDid || null,
        walletAddress: userData.walletAddress || null,
        displayName: userData.displayName || null,
        email: userData.email ? userData.email.toLowerCase().trim() : null,
        passwordHash: userData.passwordHash || null,
        role: userData.role || 'CLIPPER',
        avatarUrl: userData.avatarUrl || null,
        bio: userData.bio || null,
      })
      .returning();

    return this.mapUser(records[0]);
  }

  async updateUser(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    const records = await this.db
      .update(schema.users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (!records[0]) {
      throw new Error(`User with id ${id} not found`);
    }
    return this.mapUser(records[0]);
  }

  async upsertUser(
    userData: Partial<UserEntity> & { role?: 'CLIPPER' | 'BRAND' | 'ADMIN' }
  ): Promise<UserEntity> {
    if (userData.privyDid) {
      const existing = await this.getUserByPrivyDid(userData.privyDid);
      if (existing) {
        return this.updateUser(existing.id, {
          walletAddress: userData.walletAddress ?? existing.walletAddress,
          displayName: userData.displayName ?? existing.displayName,
          email: userData.email ?? existing.email,
          role: userData.role ?? existing.role,
        });
      }
    }
    if (userData.walletAddress) {
      const existingWallet = await this.getUserByWallet(userData.walletAddress);
      if (existingWallet) {
        return this.updateUser(existingWallet.id, {
          displayName: userData.displayName ?? existingWallet.displayName,
          email: userData.email ?? existingWallet.email,
          role: userData.role ?? existingWallet.role,
        });
      }
    }

    return this.createUser({
      ...userData,
      role: userData.role || 'CLIPPER',
    });
  }

  // Source Videos & Chunks
  async createSourceVideo(
    videoData: Omit<SourceVideoEntity, 'id' | 'createdAt'>
  ): Promise<SourceVideoEntity> {
    const records = await this.db
      .insert(schema.sourceVideos)
      .values({
        platform: videoData.platform,
        videoId: videoData.videoId,
        videoIdHash: videoData.videoIdHash,
        title: videoData.title,
        durationSec: videoData.durationSec,
        transcript: videoData.transcript,
        transcriptHash: videoData.transcriptHash,
        transcriptStatus: videoData.transcriptStatus,
      })
      .returning();

    return this.mapSourceVideo(records[0]);
  }

  async getSourceVideoById(id: string): Promise<SourceVideoEntity | null> {
    const records = await this.db
      .select()
      .from(schema.sourceVideos)
      .where(eq(schema.sourceVideos.id, id))
      .limit(1);
    return records[0] ? this.mapSourceVideo(records[0]) : null;
  }

  async getSourceVideoByHash(hash: `0x${string}`): Promise<SourceVideoEntity | null> {
    const records = await this.db
      .select()
      .from(schema.sourceVideos)
      .where(eq(schema.sourceVideos.videoIdHash, hash))
      .limit(1);
    return records[0] ? this.mapSourceVideo(records[0]) : null;
  }

  async insertSourceChunks(
    chunksData: Array<Omit<SourceChunkEntity, 'id' | 'createdAt'>>
  ): Promise<SourceChunkEntity[]> {
    if (chunksData.length === 0) return [];
    const values = chunksData.map((c) => ({
      sourceVideoId: c.sourceVideoId,
      chunkIndex: c.chunkIndex,
      startSec: c.startSec.toString(),
      endSec: c.endSec.toString(),
      chunkText: c.chunkText,
      embedding: c.embedding || null,
    }));

    const records = await this.db.insert(schema.sourceChunks).values(values).returning();
    return records.map(this.mapSourceChunk);
  }

  async getSourceChunks(sourceVideoId: string): Promise<SourceChunkEntity[]> {
    const records = await this.db
      .select()
      .from(schema.sourceChunks)
      .where(eq(schema.sourceChunks.sourceVideoId, sourceVideoId))
      .orderBy(asc(schema.sourceChunks.chunkIndex));

    return records.map(this.mapSourceChunk);
  }

  // Campaigns
  async createCampaign(
    campaignData: Omit<CampaignEntity, 'id' | 'createdAt'>
  ): Promise<CampaignEntity> {
    const records = await this.db
      .insert(schema.campaigns)
      .values({
        onchainId: campaignData.onchainId,
        brandId: campaignData.brandId,
        sourceVideoId: campaignData.sourceVideoId,
        title: campaignData.title,
        rules: campaignData.rules,
        tokenAddress: campaignData.tokenAddress,
        cpmRate: campaignData.cpmRate.toString(),
        totalBudget: campaignData.totalBudget.toString(),
        maxPayoutPerClip: campaignData.maxPayoutPerClip.toString(),
        minViews: campaignData.minViews,
        deadline: campaignData.deadline,
        sourceHash: campaignData.sourceHash,
        rulesHash: campaignData.rulesHash,
        status: campaignData.status,
        createTxHash: campaignData.createTxHash,
        activatedAt: campaignData.activatedAt,
      })
      .returning();

    return this.mapCampaign(records[0]);
  }

  async getCampaignById(id: string): Promise<CampaignEntity | null> {
    const records = await this.db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, id))
      .limit(1);
    return records[0] ? this.mapCampaign(records[0]) : null;
  }

  async getCampaignByOnchainId(onchainId: bigint): Promise<CampaignEntity | null> {
    const records = await this.db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.onchainId, onchainId))
      .limit(1);
    return records[0] ? this.mapCampaign(records[0]) : null;
  }

  async listCampaigns(filter?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<CampaignEntity[]> {
    let query = this.db.select().from(schema.campaigns);
    if (filter?.status) {
      query = query.where(eq(schema.campaigns.status, filter.status as any)) as any;
    }
    const records = await query
      .orderBy(desc(schema.campaigns.createdAt))
      .limit(filter?.limit || 20);

    return records.map(this.mapCampaign);
  }

  async updateCampaignStatus(
    id: string,
    status: CampaignEntity['status'],
    onchainId?: bigint
  ): Promise<void> {
    const updates: Partial<typeof schema.campaigns.$inferInsert> = { status };
    if (onchainId !== undefined) updates.onchainId = onchainId;
    if (status === 'ACTIVE') updates.activatedAt = new Date();

    await this.db.update(schema.campaigns).set(updates).where(eq(schema.campaigns.id, id));
  }

  // Participants
  async joinCampaign(
    campaignId: string,
    userId: string,
    verificationCode: string
  ): Promise<CampaignParticipantEntity> {
    const records = await this.db
      .insert(schema.campaignParticipants)
      .values({
        campaignId,
        userId,
        verificationCode,
      })
      .onConflictDoNothing()
      .returning();

    if (records[0]) return this.mapParticipant(records[0]);
    const existing = await this.getParticipant(campaignId, userId);
    if (!existing) throw new Error('Gagal bergabung ke kampanye');
    return existing;
  }

  async getParticipant(
    campaignId: string,
    userId: string
  ): Promise<CampaignParticipantEntity | null> {
    const records = await this.db
      .select()
      .from(schema.campaignParticipants)
      .where(
        and(
          eq(schema.campaignParticipants.campaignId, campaignId),
          eq(schema.campaignParticipants.userId, userId)
        )
      )
      .limit(1);

    return records[0] ? this.mapParticipant(records[0]) : null;
  }

  async countParticipants(campaignId: string): Promise<number> {
    const res = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaignParticipants)
      .where(eq(schema.campaignParticipants.campaignId, campaignId));

    return Number(res[0]?.count || 0);
  }

  // Clips
  async createClip(clipData: Omit<ClipEntity, 'id' | 'submittedAt'>): Promise<ClipEntity> {
    const records = await this.db
      .insert(schema.clips)
      .values({
        onchainId: clipData.onchainId,
        campaignId: clipData.campaignId,
        clipperId: clipData.clipperId,
        platform: clipData.platform,
        videoId: clipData.videoId,
        videoIdHash: clipData.videoIdHash,
        url: clipData.url,
        verificationCode: clipData.verificationCode,
        publishedAt: clipData.publishedAt,
        durationSec: clipData.durationSec,
        transcript: clipData.transcript,
        transcriptHash: clipData.transcriptHash,
        paidViews: clipData.paidViews,
        releasedAmount: clipData.releasedAmount.toString(),
        holdbackAmount: clipData.holdbackAmount.toString(),
        holdbackUnlockAt: clipData.holdbackUnlockAt,
        status: clipData.status,
        rejectionCode: clipData.rejectionCode,
        rejectionReason: clipData.rejectionReason,
        registerTxHash: clipData.registerTxHash,
        lastVerifiedAt: clipData.lastVerifiedAt,
        nextCheckAt: clipData.nextCheckAt,
      })
      .returning();

    return this.mapClip(records[0]);
  }

  async getClipById(id: string): Promise<ClipEntity | null> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(eq(schema.clips.id, id))
      .limit(1);
    return records[0] ? this.mapClip(records[0]) : null;
  }

  async getClipByVideoHash(hash: `0x${string}`): Promise<ClipEntity | null> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(eq(schema.clips.videoIdHash, hash))
      .limit(1);
    return records[0] ? this.mapClip(records[0]) : null;
  }

  async listClipsByCampaign(campaignId: string): Promise<ClipEntity[]> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(eq(schema.clips.campaignId, campaignId))
      .orderBy(desc(schema.clips.submittedAt));

    return records.map(this.mapClip);
  }

  async listClipsByClipper(clipperId: string): Promise<ClipEntity[]> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(eq(schema.clips.clipperId, clipperId))
      .orderBy(desc(schema.clips.submittedAt));

    return records.map(this.mapClip);
  }

  async countClipsByCampaign(campaignId: string): Promise<number> {
    const res = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.clips)
      .where(eq(schema.clips.campaignId, campaignId));

    return Number(res[0]?.count || 0);
  }

  async updateClip(id: string, updates: Partial<ClipEntity>): Promise<ClipEntity> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.onchainId !== undefined) dbUpdates.onchainId = updates.onchainId;
    if (updates.paidViews !== undefined) dbUpdates.paidViews = updates.paidViews;
    if (updates.releasedAmount !== undefined)
      dbUpdates.releasedAmount = updates.releasedAmount.toString();
    if (updates.holdbackAmount !== undefined)
      dbUpdates.holdbackAmount = updates.holdbackAmount.toString();
    if (updates.holdbackUnlockAt !== undefined)
      dbUpdates.holdbackUnlockAt = updates.holdbackUnlockAt;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.rejectionCode !== undefined) dbUpdates.rejectionCode = updates.rejectionCode;
    if (updates.rejectionReason !== undefined)
      dbUpdates.rejectionReason = updates.rejectionReason;
    if (updates.registerTxHash !== undefined)
      dbUpdates.registerTxHash = updates.registerTxHash;
    if (updates.lastVerifiedAt !== undefined)
      dbUpdates.lastVerifiedAt = updates.lastVerifiedAt;
    if (updates.nextCheckAt !== undefined) dbUpdates.nextCheckAt = updates.nextCheckAt;

    const records = await this.db
      .update(schema.clips)
      .set(dbUpdates)
      .where(eq(schema.clips.id, id))
      .returning();

    return this.mapClip(records[0]);
  }

  async listClipsDueForMetrics(now: Date, limit = 50): Promise<ClipEntity[]> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(
        and(
          sql`${schema.clips.status} IN ('ACTIVE', 'PENDING_VIEWS')`,
          lte(schema.clips.nextCheckAt, now)
        )
      )
      .limit(limit);

    return records.map(this.mapClip);
  }

  async listClipsDueForHoldback(now: Date, limit = 50): Promise<ClipEntity[]> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .where(
        and(
          eq(schema.clips.status, 'ACTIVE'),
          sql`${schema.clips.holdbackAmount} > 0`,
          lte(schema.clips.holdbackUnlockAt, now)
        )
      )
      .limit(limit);

    return records.map(this.mapClip);
  }

  // Verification Runs & Stages
  async createVerificationRun(
    clipId: string,
    traceId: string,
    attempt = 1
  ): Promise<VerificationRunEntity> {
    const records = await this.db
      .insert(schema.verificationRuns)
      .values({ clipId, traceId, attempt })
      .returning();

    return {
      id: records[0].id,
      clipId: records[0].clipId,
      attempt: records[0].attempt,
      traceId: records[0].traceId,
      outcome: records[0].outcome,
      durationMs: records[0].durationMs,
      startedAt: records[0].startedAt,
      finishedAt: records[0].finishedAt,
    };
  }

  async completeVerificationRun(
    id: string,
    outcome: string,
    durationMs: number
  ): Promise<void> {
    await this.db
      .update(schema.verificationRuns)
      .set({ outcome, durationMs, finishedAt: new Date() })
      .where(eq(schema.verificationRuns.id, id));
  }

  async listRunsByClipId(clipId: string): Promise<VerificationRunEntity[]> {
    const records = await this.db
      .select()
      .from(schema.verificationRuns)
      .where(eq(schema.verificationRuns.clipId, clipId))
      .orderBy(desc(schema.verificationRuns.startedAt));

    return records.map((r) => ({
      id: r.id,
      clipId: r.clipId,
      attempt: r.attempt,
      traceId: r.traceId,
      outcome: r.outcome,
      durationMs: r.durationMs,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
    }));
  }

  async insertStageResult(
    resultData: Omit<StageResultEntity, 'id' | 'createdAt'>
  ): Promise<StageResultEntity> {
    const records = await this.db
      .insert(schema.stageResults)
      .values({
        runId: resultData.runId,
        stage: resultData.stage,
        stageOrder: resultData.stageOrder,
        status: resultData.status,
        score: resultData.score !== null ? resultData.score.toString() : null,
        data: resultData.data,
        reason: resultData.reason,
        durationMs: resultData.durationMs,
        modelVersion: resultData.modelVersion,
      })
      .returning();

    return {
      id: records[0].id,
      runId: records[0].runId,
      stage: records[0].stage,
      stageOrder: records[0].stageOrder,
      status: records[0].status,
      score: records[0].score !== null ? parseFloat(records[0].score) : null,
      data: records[0].data as Record<string, unknown>,
      reason: records[0].reason,
      durationMs: records[0].durationMs,
      modelVersion: records[0].modelVersion,
      createdAt: records[0].createdAt,
    };
  }

  async listStageResultsByRun(runId: string): Promise<StageResultEntity[]> {
    const records = await this.db
      .select()
      .from(schema.stageResults)
      .where(eq(schema.stageResults.runId, runId))
      .orderBy(asc(schema.stageResults.stageOrder));

    return records.map((r) => ({
      id: r.id,
      runId: r.runId,
      stage: r.stage,
      stageOrder: r.stageOrder,
      status: r.status,
      score: r.score !== null ? parseFloat(r.score) : null,
      data: r.data as Record<string, unknown>,
      reason: r.reason,
      durationMs: r.durationMs,
      modelVersion: r.modelVersion,
      createdAt: r.createdAt,
    }));
  }

  // Attestations & Evidence
  async createAttestation(
    data: Omit<AttestationEntity, 'id' | 'createdAt'>
  ): Promise<AttestationEntity> {
    const records = await this.db
      .insert(schema.attestations)
      .values({
        clipId: data.clipId,
        runId: data.runId,
        nonce: data.nonce,
        verifiedViews: data.verifiedViews,
        sourceMatchBps: data.sourceMatchBps,
        safetyBps: data.safetyBps,
        anomalyBps: data.anomalyBps,
        evidenceHash: data.evidenceHash,
        ipfsCid: data.ipfsCid,
        expiry: data.expiry,
        signature: data.signature,
        signerAddress: data.signerAddress,
        txHash: data.txHash,
        txStatus: data.txStatus,
        gasUsed: data.gasUsed,
        blockNumber: data.blockNumber,
        releasedAmount: data.releasedAmount?.toString() || null,
        holdbackAmount: data.holdbackAmount?.toString() || null,
        confirmedAt: data.confirmedAt,
      })
      .returning();

    return this.mapAttestation(records[0]);
  }

  async getAttestationById(id: string): Promise<AttestationEntity | null> {
    const records = await this.db
      .select()
      .from(schema.attestations)
      .where(eq(schema.attestations.id, id))
      .limit(1);
    return records[0] ? this.mapAttestation(records[0]) : null;
  }

  async listAttestationsByClip(clipId: string): Promise<AttestationEntity[]> {
    const records = await this.db
      .select()
      .from(schema.attestations)
      .where(eq(schema.attestations.clipId, clipId))
      .orderBy(desc(schema.attestations.createdAt));

    return records.map(this.mapAttestation);
  }

  async updateAttestationTx(
    id: string,
    txHash: string,
    status: AttestationEntity['txStatus'],
    blockNumber?: bigint,
    gasUsed?: bigint
  ): Promise<void> {
    const updates: Partial<typeof schema.attestations.$inferInsert> = {
      txHash,
      txStatus: status,
    };
    if (blockNumber !== undefined) updates.blockNumber = blockNumber;
    if (gasUsed !== undefined) updates.gasUsed = gasUsed;
    if (status === 'CONFIRMED') updates.confirmedAt = new Date();

    await this.db
      .update(schema.attestations)
      .set(updates)
      .where(eq(schema.attestations.id, id));
  }

  async getNextNonce(): Promise<bigint> {
    // Atomic Postgres sequence prevents nonce collision under parallel workers
    const res = await this.db.execute(sql`SELECT nextval('attestation_nonce_seq') as next_val`);
    return BigInt(res[0].next_val as string);
  }

  async createEvidenceBundle(
    bundleData: Omit<EvidenceBundleEntity, 'id' | 'createdAt'>
  ): Promise<EvidenceBundleEntity> {
    const records = await this.db
      .insert(schema.evidenceBundles)
      .values({
        attestationId: bundleData.attestationId,
        payload: bundleData.payload,
        payloadHash: bundleData.payloadHash,
        ipfsCid: bundleData.ipfsCid,
        ipfsStatus: bundleData.ipfsStatus,
      })
      .returning();

    return {
      id: records[0].id,
      attestationId: records[0].attestationId,
      payload: records[0].payload as EvidenceBundle,
      payloadHash: records[0].payloadHash as `0x${string}`,
      ipfsCid: records[0].ipfsCid,
      ipfsStatus: records[0].ipfsStatus,
      createdAt: records[0].createdAt,
    };
  }

  async getEvidenceBundleByAttestation(
    attestationId: string
  ): Promise<EvidenceBundleEntity | null> {
    const records = await this.db
      .select()
      .from(schema.evidenceBundles)
      .where(eq(schema.evidenceBundles.attestationId, attestationId))
      .limit(1);

    return records[0]
      ? {
          id: records[0].id,
          attestationId: records[0].attestationId,
          payload: records[0].payload as EvidenceBundle,
          payloadHash: records[0].payloadHash as `0x${string}`,
          ipfsCid: records[0].ipfsCid,
          ipfsStatus: records[0].ipfsStatus,
          createdAt: records[0].createdAt,
        }
      : null;
  }

  // Metric Snapshots
  async recordMetricSnapshot(
    data: Omit<MetricSnapshotEntity, 'id' | 'capturedAt'>
  ): Promise<MetricSnapshotEntity> {
    const records = await this.db
      .insert(schema.metricSnapshots)
      .values({
        clipId: data.clipId,
        views: data.views,
        likes: data.likes,
        comments: data.comments,
      })
      .returning();

    return {
      id: records[0].id,
      clipId: records[0].clipId,
      views: records[0].views,
      likes: records[0].likes,
      comments: records[0].comments,
      capturedAt: records[0].capturedAt,
    };
  }

  async getMetricSnapshots(clipId: string): Promise<MetricSnapshotEntity[]> {
    const records = await this.db
      .select()
      .from(schema.metricSnapshots)
      .where(eq(schema.metricSnapshots.clipId, clipId))
      .orderBy(desc(schema.metricSnapshots.capturedAt));

    return records.map((r) => ({
      id: r.id,
      clipId: r.clipId,
      views: r.views,
      likes: r.likes,
      comments: r.comments,
      capturedAt: r.capturedAt,
    }));
  }

  // Appeals
  async createAppeal(
    appealData: Omit<AppealEntity, 'id' | 'createdAt' | 'resolvedAt'> & { id?: string }
  ): Promise<AppealEntity> {
    const records = await this.db
      .insert(schema.appeals)
      .values({
        id: appealData.id,
        clipId: appealData.clipId,
        clipperId: appealData.clipperId,
        reason: appealData.reason,
        status: appealData.status,
        reviewNotes: appealData.reviewNotes,
      })
      .returning();

    return {
      id: records[0].id,
      clipId: records[0].clipId,
      clipperId: records[0].clipperId,
      reason: records[0].reason,
      status: records[0].status,
      reviewNotes: records[0].reviewNotes,
      createdAt: records[0].createdAt,
      resolvedAt: records[0].resolvedAt,
    };
  }

  async getAppealsByClip(clipId: string): Promise<AppealEntity[]> {
    const records = await this.db
      .select()
      .from(schema.appeals)
      .where(eq(schema.appeals.clipId, clipId))
      .orderBy(desc(schema.appeals.createdAt));

    return records.map((r) => ({
      id: r.id,
      clipId: r.clipId,
      clipperId: r.clipperId,
      reason: r.reason,
      status: r.status,
      reviewNotes: r.reviewNotes,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }));
  }

  async getAllAppeals(): Promise<AppealEntity[]> {
    const records = await this.db
      .select()
      .from(schema.appeals)
      .orderBy(desc(schema.appeals.createdAt));

    return records.map((r) => ({
      id: r.id,
      clipId: r.clipId,
      clipperId: r.clipperId,
      reason: r.reason,
      status: r.status,
      reviewNotes: r.reviewNotes,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }));
  }

  async getAppealById(id: string): Promise<AppealEntity | null> {
    const records = await this.db
      .select()
      .from(schema.appeals)
      .where(eq(schema.appeals.id, id))
      .limit(1);

    if (!records[0]) return null;
    return {
      id: records[0].id,
      clipId: records[0].clipId,
      clipperId: records[0].clipperId,
      reason: records[0].reason,
      status: records[0].status,
      reviewNotes: records[0].reviewNotes,
      createdAt: records[0].createdAt,
      resolvedAt: records[0].resolvedAt,
    };
  }

  async updateAppeal(id: string, updates: Partial<AppealEntity>): Promise<AppealEntity | null> {
    const records = await this.db
      .update(schema.appeals)
      .set({
        status: updates.status,
        reviewNotes: updates.reviewNotes,
        resolvedAt: updates.resolvedAt,
      })
      .where(eq(schema.appeals.id, id))
      .returning();

    if (!records[0]) return null;
    return {
      id: records[0].id,
      clipId: records[0].clipId,
      clipperId: records[0].clipperId,
      reason: records[0].reason,
      status: records[0].status,
      reviewNotes: records[0].reviewNotes,
      createdAt: records[0].createdAt,
      resolvedAt: records[0].resolvedAt,
    };
  }

  async deleteAppeal(id: string): Promise<boolean> {
    await this.db.delete(schema.appeals).where(eq(schema.appeals.id, id));
    return true;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    await this.db.delete(schema.campaigns).where(eq(schema.campaigns.id, id));
    return true;
  }

  async deleteClip(id: string): Promise<boolean> {
    await this.db.delete(schema.clips).where(eq(schema.clips.id, id));
    return true;
  }

  async listAllClips(): Promise<ClipEntity[]> {
    const records = await this.db
      .select()
      .from(schema.clips)
      .orderBy(desc(schema.clips.submittedAt));

    return records.map((r) => this.mapClip(r));
  }

  async close(): Promise<void> {
    await this.sqlClient.end();
  }

  // Helpers
  private mapUser(record: typeof schema.users.$inferSelect): UserEntity {
    return {
      id: record.id,
      privyDid: record.privyDid,
      walletAddress: record.walletAddress,
      displayName: record.displayName,
      email: record.email,
      passwordHash: record.passwordHash,
      role: (record.role as UserRole) || 'CLIPPER',
      avatarUrl: record.avatarUrl,
      bio: record.bio,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private mapSourceVideo(record: typeof schema.sourceVideos.$inferSelect): SourceVideoEntity {
    return {
      id: record.id,
      platform: record.platform,
      videoId: record.videoId,
      videoIdHash: record.videoIdHash as `0x${string}`,
      title: record.title,
      durationSec: record.durationSec,
      transcript: record.transcript,
      transcriptHash: record.transcriptHash as `0x${string}` | null,
      transcriptStatus: record.transcriptStatus,
      createdAt: record.createdAt,
    };
  }

  private mapSourceChunk(record: typeof schema.sourceChunks.$inferSelect): SourceChunkEntity {
    return {
      id: record.id,
      sourceVideoId: record.sourceVideoId,
      chunkIndex: record.chunkIndex,
      startSec: parseFloat(record.startSec),
      endSec: parseFloat(record.endSec),
      chunkText: record.chunkText,
      embedding: (record.embedding as number[]) || undefined,
      createdAt: record.createdAt,
    };
  }

  private mapCampaign(record: typeof schema.campaigns.$inferSelect): CampaignEntity {
    return {
      id: record.id,
      onchainId: record.onchainId,
      brandId: record.brandId,
      sourceVideoId: record.sourceVideoId,
      title: record.title,
      rules: record.rules,
      tokenAddress: record.tokenAddress,
      cpmRate: BigInt(record.cpmRate),
      totalBudget: BigInt(record.totalBudget),
      maxPayoutPerClip: BigInt(record.maxPayoutPerClip),
      minViews: record.minViews,
      deadline: record.deadline,
      sourceHash: record.sourceHash as `0x${string}`,
      rulesHash: record.rulesHash as `0x${string}`,
      status: record.status,
      createTxHash: record.createTxHash,
      createdAt: record.createdAt,
      activatedAt: record.activatedAt,
    };
  }

  private mapParticipant(
    record: typeof schema.campaignParticipants.$inferSelect
  ): CampaignParticipantEntity {
    return {
      id: record.id,
      campaignId: record.campaignId,
      userId: record.userId,
      verificationCode: record.verificationCode,
      joinedAt: record.joinedAt,
    };
  }

  private mapClip(record: typeof schema.clips.$inferSelect): ClipEntity {
    return {
      id: record.id,
      onchainId: record.onchainId,
      campaignId: record.campaignId,
      clipperId: record.clipperId,
      platform: record.platform,
      videoId: record.videoId,
      videoIdHash: record.videoIdHash as `0x${string}`,
      url: record.url,
      verificationCode: record.verificationCode,
      publishedAt: record.publishedAt,
      durationSec: record.durationSec,
      transcript: record.transcript,
      transcriptHash: record.transcriptHash as `0x${string}` | null,
      paidViews: record.paidViews,
      releasedAmount: BigInt(record.releasedAmount),
      holdbackAmount: BigInt(record.holdbackAmount),
      holdbackUnlockAt: record.holdbackUnlockAt,
      status: record.status,
      rejectionCode: record.rejectionCode,
      rejectionReason: record.rejectionReason,
      registerTxHash: record.registerTxHash,
      submittedAt: record.submittedAt,
      lastVerifiedAt: record.lastVerifiedAt,
      nextCheckAt: record.nextCheckAt,
    };
  }

  private mapAttestation(record: typeof schema.attestations.$inferSelect): AttestationEntity {
    return {
      id: record.id,
      clipId: record.clipId,
      runId: record.runId,
      nonce: record.nonce,
      verifiedViews: record.verifiedViews,
      sourceMatchBps: record.sourceMatchBps,
      safetyBps: record.safetyBps,
      anomalyBps: record.anomalyBps,
      evidenceHash: record.evidenceHash as `0x${string}`,
      ipfsCid: record.ipfsCid,
      expiry: record.expiry,
      signature: record.signature,
      signerAddress: record.signerAddress,
      txHash: record.txHash,
      txStatus: record.txStatus,
      gasUsed: record.gasUsed,
      blockNumber: record.blockNumber,
      releasedAmount: record.releasedAmount ? BigInt(record.releasedAmount) : null,
      holdbackAmount: record.holdbackAmount ? BigInt(record.holdbackAmount) : null,
      createdAt: record.createdAt,
      confirmedAt: record.confirmedAt,
    };
  }
}
