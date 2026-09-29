import type { IDatabaseRepository } from './repository.js';
import { InMemoryDatabaseRepository } from './in-memory.js';
import { DrizzleDatabaseRepository } from './drizzle.js';

export class ResilientDatabaseRepository implements IDatabaseRepository {
  private primary: DrizzleDatabaseRepository | null = null;
  private fallback: InMemoryDatabaseRepository;
  private isPrimaryBroken = false;
  private fallbackSeeded = false;

  constructor(databaseUrl?: string) {
    this.fallback = new InMemoryDatabaseRepository();
    if (databaseUrl && process.env.NODE_ENV !== 'test') {
      try {
        this.primary = new DrizzleDatabaseRepository(databaseUrl);
      } catch {
        this.primary = null;
        this.isPrimaryBroken = true;
      }
    } else {
      this.isPrimaryBroken = true;
    }
  }

  public async ensureFallbackSeeded(): Promise<void> {
    if (!this.fallbackSeeded) {
      this.fallbackSeeded = true;
      try {
        const { seedDemoData } = await import('./seed.js');
        await seedDemoData(this.fallback);
      } catch {
        // ignore if already seeded or during tests
      }
    }
  }

  private async execute<T>(opName: string, fn: (repo: IDatabaseRepository) => Promise<T>): Promise<T> {
    if (this.primary && !this.isPrimaryBroken) {
      try {
        return await fn(this.primary);
      } catch (err: any) {
        console.warn(`[DB] Operation "${opName}" failed on primary Postgres DB (${err?.message || err}). Falling back to InMemoryDatabaseRepository.`);
        this.isPrimaryBroken = true;
        await this.ensureFallbackSeeded();
        return await fn(this.fallback);
      }
    }
    await this.ensureFallbackSeeded();
    return await fn(this.fallback);
  }

  // Users
  getUserById(id: string) { return this.execute('getUserById', (r) => r.getUserById(id)); }
  getUserByPrivyDid(privyDid: string) { return this.execute('getUserByPrivyDid', (r) => r.getUserByPrivyDid(privyDid)); }
  getUserByWallet(address: string) { return this.execute('getUserByWallet', (r) => r.getUserByWallet(address)); }
  getUserByEmail(email: string) { return this.execute('getUserByEmail', (r) => r.getUserByEmail(email)); }
  upsertUser(user: any) { return this.execute('upsertUser', (r) => r.upsertUser(user)); }
  createUser(user: any) { return this.execute('createUser', (r) => r.createUser(user)); }
  updateUser(id: string, updates: any) { return this.execute('updateUser', (r) => r.updateUser(id, updates)); }

  // Source Videos & Chunks
  createSourceVideo(video: any) { return this.execute('createSourceVideo', (r) => r.createSourceVideo(video)); }
  getSourceVideoById(id: string) { return this.execute('getSourceVideoById', (r) => r.getSourceVideoById(id)); }
  getSourceVideoByHash(hash: any) { return this.execute('getSourceVideoByHash', (r) => r.getSourceVideoByHash(hash)); }
  insertSourceChunks(chunks: any) { return this.execute('insertSourceChunks', (r) => r.insertSourceChunks(chunks)); }
  getSourceChunks(sourceVideoId: string) { return this.execute('getSourceChunks', (r) => r.getSourceChunks(sourceVideoId)); }

  // Campaigns
  createCampaign(campaign: any) { return this.execute('createCampaign', (r) => r.createCampaign(campaign)); }
  getCampaignById(id: string) { return this.execute('getCampaignById', (r) => r.getCampaignById(id)); }
  getCampaignByOnchainId(onchainId: bigint) { return this.execute('getCampaignByOnchainId', (r) => r.getCampaignByOnchainId(onchainId)); }
  listCampaigns(filter?: any) { return this.execute('listCampaigns', (r) => r.listCampaigns(filter)); }
  updateCampaignStatus(id: string, status: any, onchainId?: bigint) { return this.execute('updateCampaignStatus', (r) => r.updateCampaignStatus(id, status, onchainId)); }

  // Campaign Participants
  joinCampaign(campaignId: string, userId: string, verificationCode: string) { return this.execute('joinCampaign', (r) => r.joinCampaign(campaignId, userId, verificationCode)); }
  getParticipant(campaignId: string, userId: string) { return this.execute('getParticipant', (r) => r.getParticipant(campaignId, userId)); }
  countParticipants(campaignId: string) { return this.execute('countParticipants', (r) => r.countParticipants(campaignId)); }

  // Clips
  createClip(clip: any) { return this.execute('createClip', (r) => r.createClip(clip)); }
  getClipById(id: string) { return this.execute('getClipById', (r) => r.getClipById(id)); }
  getClipByVideoHash(hash: any) { return this.execute('getClipByVideoHash', (r) => r.getClipByVideoHash(hash)); }
  listClipsByCampaign(campaignId: string) { return this.execute('listClipsByCampaign', (r) => r.listClipsByCampaign(campaignId)); }
  listClipsByClipper(clipperId: string) { return this.execute('listClipsByClipper', (r) => r.listClipsByClipper(clipperId)); }
  countClipsByCampaign(campaignId: string) { return this.execute('countClipsByCampaign', (r) => r.countClipsByCampaign(campaignId)); }
  updateClip(id: string, updates: any) { return this.execute('updateClip', (r) => r.updateClip(id, updates)); }
  listClipsDueForMetrics(now: Date, limit?: number) { return this.execute('listClipsDueForMetrics', (r) => r.listClipsDueForMetrics(now, limit)); }
  listClipsDueForHoldback(now: Date, limit?: number) { return this.execute('listClipsDueForHoldback', (r) => r.listClipsDueForHoldback(now, limit)); }

  // Verification Runs & Stage Results
  createVerificationRun(clipId: string, traceId: string, attempt?: number) { return this.execute('createVerificationRun', (r) => r.createVerificationRun(clipId, traceId, attempt)); }
  completeVerificationRun(id: string, outcome: string, durationMs: number) { return this.execute('completeVerificationRun', (r) => r.completeVerificationRun(id, outcome, durationMs)); }
  listRunsByClipId(clipId: string) { return this.execute('listRunsByClipId', (r) => r.listRunsByClipId(clipId)); }
  insertStageResult(result: any) { return this.execute('insertStageResult', (r) => r.insertStageResult(result)); }
  listStageResultsByRun(runId: string) { return this.execute('listStageResultsByRun', (r) => r.listStageResultsByRun(runId)); }

  // Attestations & Evidence
  createAttestation(attestation: any) { return this.execute('createAttestation', (r) => r.createAttestation(attestation)); }
  getAttestationById(id: string) { return this.execute('getAttestationById', (r) => r.getAttestationById(id)); }
  listAttestationsByClip(clipId: string) { return this.execute('listAttestationsByClip', (r) => r.listAttestationsByClip(clipId)); }
  updateAttestationTx(id: string, txHash: string, status: any, blockNumber?: bigint, gasUsed?: bigint) { return this.execute('updateAttestationTx', (r) => r.updateAttestationTx(id, txHash, status, blockNumber, gasUsed)); }
  getNextNonce() { return this.execute('getNextNonce', (r) => r.getNextNonce()); }
  createEvidenceBundle(bundle: any) { return this.execute('createEvidenceBundle', (r) => r.createEvidenceBundle(bundle)); }
  getEvidenceBundleByAttestation(attestationId: string) { return this.execute('getEvidenceBundleByAttestation', (r) => r.getEvidenceBundleByAttestation(attestationId)); }

  // Metric Snapshots
  recordMetricSnapshot(snapshot: any) { return this.execute('recordMetricSnapshot', (r) => r.recordMetricSnapshot(snapshot)); }
  getMetricSnapshots(clipId: string) { return this.execute('getMetricSnapshots', (r) => r.getMetricSnapshots(clipId)); }

  // Appeals
  createAppeal(appeal: any) { return this.execute('createAppeal', (r) => r.createAppeal(appeal)); }
  getAppealsByClip(clipId: string) { return this.execute('getAppealsByClip', (r) => r.getAppealsByClip(clipId)); }
  getAllAppeals() { return this.execute('getAllAppeals', (r) => r.getAllAppeals()); }
  getAppealById(id: string) { return this.execute('getAppealById', (r) => r.getAppealById(id)); }
  updateAppeal(id: string, updates: any) { return this.execute('updateAppeal', (r) => r.updateAppeal(id, updates)); }
  deleteAppeal(id: string) { return this.execute('deleteAppeal', (r) => r.deleteAppeal(id)); }

  // Admin CRUD helpers
  deleteCampaign(id: string) { return this.execute('deleteCampaign', (r) => r.deleteCampaign(id)); }
  deleteClip(id: string) { return this.execute('deleteClip', (r) => r.deleteClip(id)); }
  listAllClips() { return this.execute('listAllClips', (r) => r.listAllClips()); }
}

let activeRepository: IDatabaseRepository | null = null;

export function getDatabaseRepository(): IDatabaseRepository {
  if (!activeRepository) {
    const databaseUrl = process.env.DATABASE_URL;
    activeRepository = new ResilientDatabaseRepository(databaseUrl);
  }
  return activeRepository;
}

export function setDatabaseRepository(repo: IDatabaseRepository): void {
  activeRepository = repo;
}
