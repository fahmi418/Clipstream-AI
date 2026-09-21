import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import { MockChainService } from '../src/services/chain.service.js';
import { VerifyClipWorker } from '../src/workers/verify-clip.worker.js';
import { PollMetricsWorker } from '../src/workers/poll-metrics.worker.js';
import { ClaimHoldbackWorker } from '../src/workers/claim-holdback.worker.js';
import { ReconcileChainWorker } from '../src/workers/reconcile-chain.worker.js';
import {
  MockYouTubeAdapter,
  MockWhisperAdapter,
  MockEmbeddingAdapter,
  MockLlmAdapter,
  AgentSigner,
  chunkTranscript,
} from '@clipstream/agent';
import { OPBNB_TESTNET_CHAIN_ID } from '@clipstream/shared';

describe('Backend Workers & Queue Handlers', () => {
  let repo: InMemoryDatabaseRepository;
  let chain: MockChainService;
  let yt: MockYouTubeAdapter;
  let whisper: MockWhisperAdapter;
  let embedding: MockEmbeddingAdapter;
  let llm: MockLlmAdapter;
  let signer: AgentSigner;

  beforeEach(() => {
    repo = new InMemoryDatabaseRepository();
    chain = new MockChainService();
    yt = new MockYouTubeAdapter();
    whisper = new MockWhisperAdapter();
    embedding = new MockEmbeddingAdapter();
    llm = new MockLlmAdapter();

    const agentKey =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    signer = new AgentSigner(agentKey, {
      chainId: OPBNB_TESTNET_CHAIN_ID,
      verifyingContract: '0x1234567890123456789012345678901234567890',
    });
  });

  it('VerifyClipWorker processes clip and settles payment onchain', async () => {
    const brand = await repo.upsertUser({
      privyDid: 'did:privy:brand01',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      displayName: 'Brand User',
      email: null,
    });

    const clipper = await repo.upsertUser({
      privyDid: 'did:privy:clipper01',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      displayName: 'Clipper User',
      email: null,
    });

    const src = await repo.createSourceVideo({
      platform: 'youtube',
      videoId: 'sourceVid01',
      videoIdHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      title: 'Podcast Bincang Web3',
      durationSec: 1800,
      transcript:
        'Halo semua, episode podcast bincang teknologi mendiskusikan Web3 dan ekosistem AI agent secara komprehensif.',
      transcriptHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      transcriptStatus: 'READY',
    });

    const campaign = await repo.createCampaign({
      onchainId: 1n,
      brandId: brand.id,
      sourceVideoId: src.id,
      title: 'Kampanye Podcast Web3',
      rules: 'Wajib tanpa SARA, tanpa promosi palsu.',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      cpmRate: 300000n,
      totalBudget: 50000000n,
      maxPayoutPerClip: 15000000n,
      minViews: 1000,
      deadline: new Date(Date.now() + 86400_000 * 7),
      sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      status: 'ACTIVE',
      createTxHash: null,
      activatedAt: new Date(),
    });

    const participant = await repo.joinCampaign(
      campaign.id,
      clipper.id,
      'CS-1-abcdef'
    );

    const videoId = 'clipVid0001'; // 11 chars
    const clip = await repo.createClip({
      onchainId: 1n,
      campaignId: campaign.id,
      clipperId: clipper.id,
      platform: 'youtube',
      videoId,
      videoIdHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      url: `https://youtube.com/shorts/${videoId}`,
      verificationCode: participant.verificationCode,
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 0,
      releasedAmount: 0n,
      holdbackAmount: 0n,
      holdbackUnlockAt: null,
      status: 'SUBMITTED',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: new Date(),
    });

    yt.setFixture(videoId, {
      videoId,
      title: 'Highlight Web3 AI Episode',
      description: 'Potongan seru diskusi Web3! Kode verifikasi: CS-1-abcdef',
      publishedAt: new Date(Date.now() + 1000),
      channelId: 'UC_CLIPPER',
      durationSec: 50,
      views: 12000,
      likes: 650,
      comments: 45,
    });

    const clipTranscript =
      'Halo semua, episode podcast bincang teknologi mendiskusikan Web3 dan ekosistem AI agent secara komprehensif.';
    whisper.setTranscript(videoId, clipTranscript, [
      { start: 0, end: 25, text: 'Halo semua, episode podcast bincang teknologi' },
      { start: 25, end: 50, text: 'mendiskusikan Web3 dan ekosistem AI agent secara komprehensif.' },
    ]);

    const worker = new VerifyClipWorker({
      repo,
      chain,
      youtube: yt,
      whisper,
      embedding,
      llm,
      signer,
    });

    await worker.processClip(clip.id);

    const updatedClip = await repo.getClipById(clip.id);
    expect(updatedClip?.status).toBe('ACTIVE');
    expect(updatedClip?.paidViews).toBe(12000);
    expect(updatedClip?.releasedAmount).toBeGreaterThan(0n);
    expect(updatedClip?.holdbackAmount).toBeGreaterThan(0n);

    const attestations = await repo.listAttestationsByClip(clip.id);
    expect(attestations.length).toBe(1);
    expect(attestations[0].txStatus).toBe('CONFIRMED');

    const bundle = await repo.getEvidenceBundleByAttestation(attestations[0].id);
    expect(bundle).toBeDefined();
    expect(bundle?.payload.scores.safetyBps).toBeGreaterThanOrEqual(7000);
  });

  it('PollMetricsWorker records metrics snapshot and triggers due checks', async () => {
    const videoId = 'clipVid0002';
    const clip = await repo.createClip({
      onchainId: 2n,
      campaignId: 'camp-1',
      clipperId: 'user-1',
      platform: 'youtube',
      videoId,
      videoIdHash: '0x6666666666666666666666666666666666666666666666666666666666666666',
      url: `https://youtube.com/shorts/${videoId}`,
      verificationCode: 'CS-1-abcdef',
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 5000,
      releasedAmount: 0n,
      holdbackAmount: 0n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: new Date(Date.now() - 60_000), // past due
    });

    yt.setFixture(videoId, {
      videoId,
      title: 'Shorts 2',
      description: 'Desc',
      publishedAt: new Date(),
      channelId: 'UC_TEST',
      durationSec: 30,
      views: 7500,
      likes: 300,
      comments: 20,
    });

    const pollWorker = new PollMetricsWorker(repo, yt);
    const count = await pollWorker.runPoll();

    expect(count).toBe(1);
    const snapshots = await repo.getMetricSnapshots(clip.id);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].views).toBe(7500);
  });

  it('ClaimHoldbackWorker claims matured holdback amount', async () => {
    const clip = await repo.createClip({
      onchainId: 3n,
      campaignId: 'camp-1',
      clipperId: 'user-1',
      platform: 'youtube',
      videoId: 'clipVid0003',
      videoIdHash: '0x7777777777777777777777777777777777777777777777777777777777777777',
      url: 'https://youtube.com/shorts/clipVid0003',
      verificationCode: 'CS-1-abcdef',
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 10000,
      releasedAmount: 7000000n,
      holdbackAmount: 3000000n,
      holdbackUnlockAt: new Date(Date.now() - 3600_000), // matured
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: null,
    });

    const claimWorker = new ClaimHoldbackWorker(repo, chain);
    const claimed = await claimWorker.runClaim();

    expect(claimed).toBe(1);
    const updated = await repo.getClipById(clip.id);
    expect(updated?.holdbackAmount).toBe(0n);
    expect(updated?.releasedAmount).toBe(10000000n);
    expect(updated?.holdbackUnlockAt).toBeNull();
  });

  it('ReconcileChainWorker syncs onchain financial values to database', async () => {
    const onchainId = 4n;
    const clip = await repo.createClip({
      onchainId,
      campaignId: 'camp-1',
      clipperId: 'user-1',
      platform: 'youtube',
      videoId: 'clipVid0004',
      videoIdHash: '0x8888888888888888888888888888888888888888888888888888888888888888',
      url: 'https://youtube.com/shorts/clipVid0004',
      verificationCode: 'CS-1-abcdef',
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 5000,
      releasedAmount: 3500000n,
      holdbackAmount: 1500000n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: null,
    });

    // Simulate onchain release occurred (e.g. from indexer or direct relayer)
    await chain.releaseMilestone(
      {
        clipId: onchainId,
        verifiedViews: 10000,
        sourceMatchBps: 8500,
        safetyBps: 9000,
        anomalyBps: 2000,
        evidenceHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        nonce: 999n,
        expiry: BigInt(Math.floor(Date.now() / 1000) + 3600),
      },
      '0x1234' as `0x${string}`
    );

    const reconcileWorker = new ReconcileChainWorker(repo, chain);
    const updated = await reconcileWorker.reconcileClip(clip.id);

    expect(updated).toBe(true);
    const synced = await repo.getClipById(clip.id);
    expect(synced?.paidViews).toBe(10000);
  });
});
