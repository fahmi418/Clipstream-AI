import { randomUUID } from 'node:crypto';
import type {
  IDatabaseRepository,
  UserEntity,
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

export class InMemoryDatabaseRepository implements IDatabaseRepository {
  private users = new Map<string, UserEntity>();
  private sourceVideos = new Map<string, SourceVideoEntity>();
  private sourceChunks = new Map<string, SourceChunkEntity>();
  private campaigns = new Map<string, CampaignEntity>();
  private participants = new Map<string, CampaignParticipantEntity>();
  private clips = new Map<string, ClipEntity>();
  private verificationRuns = new Map<string, VerificationRunEntity>();
  private stageResults = new Map<string, StageResultEntity>();
  private attestations = new Map<string, AttestationEntity>();
  private evidenceBundles = new Map<string, EvidenceBundleEntity>();
  private metricSnapshots = new Map<string, MetricSnapshotEntity>();
  private appeals = new Map<string, AppealEntity>();

  private nonceCounter = 1n;

  // Users
  async getUserById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async getUserByPrivyDid(privyDid: string): Promise<UserEntity | null> {
    for (const u of this.users.values()) {
      if (u.privyDid === privyDid) return u;
    }
    return null;
  }

  async getUserByWallet(address: string): Promise<UserEntity | null> {
    const normalized = address.toLowerCase();
    for (const u of this.users.values()) {
      if (u.walletAddress && u.walletAddress.toLowerCase() === normalized) return u;
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email && u.email.toLowerCase().trim() === normalized) return u;
    }
    return null;
  }

  async createUser(
    userData: Partial<UserEntity> & { role: 'CLIPPER' | 'BRAND' | 'ADMIN' }
  ): Promise<UserEntity> {
    const newUser: UserEntity = {
      id: userData.id || randomUUID(),
      privyDid: userData.privyDid || null,
      walletAddress: userData.walletAddress || null,
      displayName: userData.displayName || null,
      email: userData.email ? userData.email.toLowerCase().trim() : null,
      passwordHash: userData.passwordHash || null,
      role: userData.role || 'CLIPPER',
      avatarUrl: userData.avatarUrl || null,
      bio: userData.bio || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    Object.assign(existing, updates, { updatedAt: new Date() });
    return existing;
  }

  async upsertUser(
    userData: Partial<UserEntity> & { role?: 'CLIPPER' | 'BRAND' | 'ADMIN' }
  ): Promise<UserEntity> {
    if (userData.privyDid) {
      const existing = await this.getUserByPrivyDid(userData.privyDid);
      if (existing) {
        if (userData.walletAddress) existing.walletAddress = userData.walletAddress;
        if (userData.displayName) existing.displayName = userData.displayName;
        if (userData.email) existing.email = userData.email;
        if (userData.role) existing.role = userData.role;
        existing.updatedAt = new Date();
        return existing;
      }
    }
    if (userData.walletAddress) {
      const existingWallet = await this.getUserByWallet(userData.walletAddress);
      if (existingWallet) {
        if (userData.displayName) existingWallet.displayName = userData.displayName;
        if (userData.email) existingWallet.email = userData.email;
        if (userData.role) existingWallet.role = userData.role;
        existingWallet.updatedAt = new Date();
        return existingWallet;
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
    const newVideo: SourceVideoEntity = {
      id: randomUUID(),
      ...videoData,
      createdAt: new Date(),
    };
    this.sourceVideos.set(newVideo.id, newVideo);
    return newVideo;
  }

  async getSourceVideoById(id: string): Promise<SourceVideoEntity | null> {
    return this.sourceVideos.get(id) || null;
  }

  async getSourceVideoByHash(hash: `0x${string}`): Promise<SourceVideoEntity | null> {
    for (const v of this.sourceVideos.values()) {
      if (v.videoIdHash.toLowerCase() === hash.toLowerCase()) return v;
    }
    return null;
  }

  async insertSourceChunks(
    chunksData: Array<Omit<SourceChunkEntity, 'id' | 'createdAt'>>
  ): Promise<SourceChunkEntity[]> {
    const created: SourceChunkEntity[] = [];
    for (const chunk of chunksData) {
      const entity: SourceChunkEntity = {
        id: randomUUID(),
        ...chunk,
        createdAt: new Date(),
      };
      this.sourceChunks.set(entity.id, entity);
      created.push(entity);
    }
    return created;
  }

  async getSourceChunks(sourceVideoId: string): Promise<SourceChunkEntity[]> {
    const results: SourceChunkEntity[] = [];
    for (const c of this.sourceChunks.values()) {
      if (c.sourceVideoId === sourceVideoId) results.push(c);
    }
    return results.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  // Campaigns
  async createCampaign(
    campaignData: Omit<CampaignEntity, 'id' | 'createdAt'> & { id?: string }
  ): Promise<CampaignEntity> {
    const newCampaign: CampaignEntity = {
      ...campaignData,
      id: campaignData.id || randomUUID(),
      description: campaignData.description ?? null,
      remainingBudget: campaignData.remainingBudget ?? campaignData.totalBudget,
      status: campaignData.status || 'ACTIVE',
      onchainId: campaignData.onchainId ?? null,
      createTxHash: campaignData.createTxHash ?? null,
      activatedAt: campaignData.activatedAt ?? new Date(),
      createdAt: new Date(),
    };
    this.campaigns.set(newCampaign.id, newCampaign);
    return newCampaign;
  }

  async getCampaignById(id: string): Promise<CampaignEntity | null> {
    if (this.campaigns.has(id)) return this.campaigns.get(id)!;

    // Check by onchainId
    for (const c of this.campaigns.values()) {
      if (c.onchainId !== null && c.onchainId.toString() === id) return c;
      if (c.id === `camp-seed-${id}` || `camp-seed-${c.onchainId}` === id) return c;
    }

    // Strip camp-seed- if present
    if (id.startsWith('camp-seed-')) {
      const stripped = id.replace('camp-seed-', '');
      for (const c of this.campaigns.values()) {
        if (c.onchainId !== null && c.onchainId.toString() === stripped) return c;
      }
    }

    return null;
  }

  async getCampaignByOnchainId(onchainId: bigint): Promise<CampaignEntity | null> {
    for (const c of this.campaigns.values()) {
      if (c.onchainId === onchainId) return c;
    }
    return null;
  }

  async listCampaigns(filter?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<CampaignEntity[]> {
    let list = Array.from(this.campaigns.values());
    if (filter?.status) {
      list = list.filter((c) => c.status === filter.status);
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  async updateCampaignStatus(
    id: string,
    status: CampaignEntity['status'],
    onchainId?: bigint
  ): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error('Campaign tidak ditemukan');
    campaign.status = status;
    if (onchainId !== undefined) campaign.onchainId = onchainId;
    if (status === 'ACTIVE' && !campaign.activatedAt) {
      campaign.activatedAt = new Date();
    }
  }

  // Participants
  async joinCampaign(
    campaignId: string,
    userId: string,
    verificationCode: string
  ): Promise<CampaignParticipantEntity> {
    const existing = await this.getParticipant(campaignId, userId);
    if (existing) return existing;

    const participant: CampaignParticipantEntity = {
      id: randomUUID(),
      campaignId,
      userId,
      verificationCode,
      joinedAt: new Date(),
    };
    this.participants.set(`${campaignId}:${userId}`, participant);
    return participant;
  }

  async getParticipant(
    campaignId: string,
    userId: string
  ): Promise<CampaignParticipantEntity | null> {
    return this.participants.get(`${campaignId}:${userId}`) || null;
  }

  async countParticipants(campaignId: string): Promise<number> {
    let count = 0;
    for (const p of this.participants.values()) {
      if (p.campaignId === campaignId) count++;
    }
    return count;
  }

  // Clips
  async createClip(clipData: Omit<ClipEntity, 'id' | 'submittedAt'> & { id?: string; submittedAt?: Date }): Promise<ClipEntity> {
    const newClip: ClipEntity = {
      ...clipData,
      id: clipData.id || randomUUID(),
      submittedAt: clipData.submittedAt || new Date(),
    };
    this.clips.set(newClip.id, newClip);
    return newClip;
  }

  async getClipById(id: string): Promise<ClipEntity | null> {
    return this.clips.get(id) || null;
  }

  async getClipByVideoHash(hash: `0x${string}`): Promise<ClipEntity | null> {
    for (const c of this.clips.values()) {
      if (c.videoIdHash.toLowerCase() === hash.toLowerCase()) return c;
    }
    return null;
  }

  async listClipsByCampaign(campaignId: string): Promise<ClipEntity[]> {
    const list: ClipEntity[] = [];
    for (const c of this.clips.values()) {
      if (c.campaignId === campaignId) list.push(c);
    }
    return list.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async listClipsByClipper(clipperId: string): Promise<ClipEntity[]> {
    const list: ClipEntity[] = [];
    for (const c of this.clips.values()) {
      if (c.clipperId === clipperId) list.push(c);
    }
    return list.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async countClipsByCampaign(campaignId: string): Promise<number> {
    let count = 0;
    for (const c of this.clips.values()) {
      if (c.campaignId === campaignId) count++;
    }
    return count;
  }

  async updateClip(id: string, updates: Partial<ClipEntity>): Promise<ClipEntity> {
    const clip = this.clips.get(id);
    if (!clip) throw new Error('Clip tidak ditemukan');
    Object.assign(clip, updates);
    return clip;
  }

  async listClipsDueForMetrics(now: Date, limit = 50): Promise<ClipEntity[]> {
    const due: ClipEntity[] = [];
    for (const c of this.clips.values()) {
      if (
        (c.status === 'ACTIVE' || c.status === 'PENDING_VIEWS') &&
        c.nextCheckAt &&
        c.nextCheckAt.getTime() <= now.getTime()
      ) {
        due.push(c);
        if (due.length >= limit) break;
      }
    }
    return due;
  }

  async listClipsDueForHoldback(now: Date, limit = 50): Promise<ClipEntity[]> {
    const due: ClipEntity[] = [];
    for (const c of this.clips.values()) {
      if (
        c.status === 'ACTIVE' &&
        c.holdbackAmount > 0n &&
        c.holdbackUnlockAt &&
        c.holdbackUnlockAt.getTime() <= now.getTime()
      ) {
        due.push(c);
        if (due.length >= limit) break;
      }
    }
    return due;
  }

  // Verification Runs & Stages
  async createVerificationRun(
    clipId: string,
    traceId: string,
    attempt = 1
  ): Promise<VerificationRunEntity> {
    const run: VerificationRunEntity = {
      id: randomUUID(),
      clipId,
      attempt,
      traceId,
      outcome: null,
      durationMs: null,
      startedAt: new Date(),
      finishedAt: null,
    };
    this.verificationRuns.set(run.id, run);
    return run;
  }

  async completeVerificationRun(
    id: string,
    outcome: string,
    durationMs: number
  ): Promise<void> {
    const run = this.verificationRuns.get(id);
    if (run) {
      run.outcome = outcome;
      run.durationMs = durationMs;
      run.finishedAt = new Date();
    }
  }

  async listRunsByClipId(clipId: string): Promise<VerificationRunEntity[]> {
    const list: VerificationRunEntity[] = [];
    for (const r of this.verificationRuns.values()) {
      if (r.clipId === clipId) list.push(r);
    }
    return list.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async insertStageResult(
    resultData: Omit<StageResultEntity, 'id' | 'createdAt'>
  ): Promise<StageResultEntity> {
    const result: StageResultEntity = {
      id: randomUUID(),
      ...resultData,
      createdAt: new Date(),
    };
    this.stageResults.set(result.id, result);
    return result;
  }

  async listStageResultsByRun(runId: string): Promise<StageResultEntity[]> {
    const list: StageResultEntity[] = [];
    for (const r of this.stageResults.values()) {
      if (r.runId === runId) list.push(r);
    }
    return list.sort((a, b) => a.stageOrder - b.stageOrder);
  }

  // Attestations & Evidence
  async createAttestation(
    data: Omit<AttestationEntity, 'id' | 'createdAt'>
  ): Promise<AttestationEntity> {
    const att: AttestationEntity = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.attestations.set(att.id, att);
    return att;
  }

  async getAttestationById(id: string): Promise<AttestationEntity | null> {
    return this.attestations.get(id) || null;
  }

  async listAttestationsByClip(clipId: string): Promise<AttestationEntity[]> {
    const list: AttestationEntity[] = [];
    for (const a of this.attestations.values()) {
      if (a.clipId === clipId) list.push(a);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateAttestationTx(
    id: string,
    txHash: string,
    status: AttestationEntity['txStatus'],
    blockNumber?: bigint,
    gasUsed?: bigint
  ): Promise<void> {
    const att = this.attestations.get(id);
    if (att) {
      att.txHash = txHash;
      att.txStatus = status;
      if (blockNumber !== undefined) att.blockNumber = blockNumber;
      if (gasUsed !== undefined) att.gasUsed = gasUsed;
      if (status === 'CONFIRMED') att.confirmedAt = new Date();
    }
  }

  async getNextNonce(): Promise<bigint> {
    const current = this.nonceCounter;
    this.nonceCounter += 1n;
    return current;
  }

  async createEvidenceBundle(
    bundleData: Omit<EvidenceBundleEntity, 'id' | 'createdAt'>
  ): Promise<EvidenceBundleEntity> {
    const bundle: EvidenceBundleEntity = {
      id: randomUUID(),
      ...bundleData,
      createdAt: new Date(),
    };
    this.evidenceBundles.set(bundle.attestationId, bundle);
    return bundle;
  }

  async getEvidenceBundleByAttestation(
    attestationId: string
  ): Promise<EvidenceBundleEntity | null> {
    return this.evidenceBundles.get(attestationId) || null;
  }

  // Metric Snapshots
  async recordMetricSnapshot(
    data: Omit<MetricSnapshotEntity, 'id' | 'capturedAt'>
  ): Promise<MetricSnapshotEntity> {
    const snapshot: MetricSnapshotEntity = {
      id: randomUUID(),
      ...data,
      capturedAt: new Date(),
    };
    this.metricSnapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  async getMetricSnapshots(clipId: string): Promise<MetricSnapshotEntity[]> {
    const list: MetricSnapshotEntity[] = [];
    for (const s of this.metricSnapshots.values()) {
      if (s.clipId === clipId) list.push(s);
    }
    return list.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
  }

  // Appeals
  async createAppeal(
    appealData: Omit<AppealEntity, 'id' | 'createdAt' | 'resolvedAt'> & { id?: string }
  ): Promise<AppealEntity> {
    const appeal: AppealEntity = {
      id: appealData.id || randomUUID(),
      ...appealData,
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.appeals.set(appeal.id, appeal);
    return appeal;
  }

  async getAppealsByClip(clipId: string): Promise<AppealEntity[]> {
    const list: AppealEntity[] = [];
    for (const a of this.appeals.values()) {
      if (a.clipId === clipId) list.push(a);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllAppeals(): Promise<AppealEntity[]> {
    return Array.from(this.appeals.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAppealById(id: string): Promise<AppealEntity | null> {
    return this.appeals.get(id) || null;
  }

  async updateAppeal(id: string, updates: Partial<AppealEntity>): Promise<AppealEntity | null> {
    const existing = this.appeals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.appeals.set(id, updated);
    return updated;
  }

  async deleteAppeal(id: string): Promise<boolean> {
    return this.appeals.delete(id);
  }

  // Admin CRUD helpers
  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async deleteClip(id: string): Promise<boolean> {
    return this.clips.delete(id);
  }

  async listAllClips(): Promise<ClipEntity[]> {
    return Array.from(this.clips.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }
}
