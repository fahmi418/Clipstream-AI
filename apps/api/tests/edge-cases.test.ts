import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import { setDatabaseRepository } from '../src/db/client.js';
import { MockChainService, setChainService } from '../src/services/chain.service.js';
import { VerifyClipWorker } from '../src/workers/verify-clip.worker.js';
import { ClaimHoldbackWorker } from '../src/workers/claim-holdback.worker.js';
import { MockYouTubeAdapter, MockWhisperAdapter } from '@clipstream/agent';
import type { CampaignEntity, UserEntity } from '../src/db/repository.js';

describe('Production Edge Cases & Resilience Tests', () => {
  let app: FastifyInstance;
  let repo: InMemoryDatabaseRepository;
  let chain: MockChainService;
  let testBrand: UserEntity;
  let testClipper: UserEntity;
  let activeCampaign: CampaignEntity;

  beforeEach(async () => {
    repo = new InMemoryDatabaseRepository();
    setDatabaseRepository(repo);

    chain = new MockChainService();
    setChainService(chain);

    testBrand = await repo.upsertUser({
      privyDid: 'did:privy:edgebrand',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      displayName: 'Edge Case Brand',
      email: null,
    });

    testClipper = await repo.upsertUser({
      privyDid: 'did:privy:edgeclipper',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      displayName: 'Edge Case Clipper',
      email: null,
    });

    const sourceVideo = await repo.createSourceVideo({
      platform: 'youtube',
      videoId: 'sourceVid01',
      videoIdHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      title: 'Source Podcast Episode',
      durationSec: 1800,
      transcript: 'Full transcript of the podcast episode discussing artificial intelligence.',
      transcriptHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      transcriptStatus: 'READY',
    });

    activeCampaign = await repo.createCampaign({
      onchainId: 1n,
      brandId: testBrand.id,
      sourceVideoId: sourceVideo.id,
      title: 'Active Campaign',
      rules: 'Wajib mencantumkan kode dan tidak boleh melanggar pedoman brand.',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      cpmRate: 300000n,
      totalBudget: 50000000n,
      maxPayoutPerClip: 10000000n,
      minViews: 1000,
      deadline: new Date(Date.now() + 86400_000 * 7),
      sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      status: 'ACTIVE',
      createTxHash: null,
      activatedAt: new Date(),
    });

    app = await buildServer();
  });

  it('rejects clip submission when campaign is inactive', async () => {
    const inactiveCampaign = await repo.createCampaign({
      onchainId: 2n,
      brandId: testBrand.id,
      sourceVideoId: activeCampaign.sourceVideoId,
      title: 'Paused Campaign',
      rules: 'Rules',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      cpmRate: 300000n,
      totalBudget: 50000000n,
      maxPayoutPerClip: 10000000n,
      minViews: 1000,
      deadline: new Date(Date.now() + 86400_000 * 7),
      sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      status: 'ENDED',
      createTxHash: null,
      activatedAt: new Date(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: inactiveCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0001',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('CAMPAIGN_INACTIVE');
  });

  it('rejects clip submission when campaign deadline has passed', async () => {
    const expiredCampaign = await repo.createCampaign({
      onchainId: 3n,
      brandId: testBrand.id,
      sourceVideoId: activeCampaign.sourceVideoId,
      title: 'Expired Campaign',
      rules: 'Rules',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      cpmRate: 300000n,
      totalBudget: 50000000n,
      maxPayoutPerClip: 10000000n,
      minViews: 1000,
      deadline: new Date(Date.now() - 3600_000), // 1 hour ago
      sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      status: 'ACTIVE',
      createTxHash: null,
      activatedAt: new Date(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: expiredCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0002',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('CAMPAIGN_EXPIRED');
  });

  it('blocks SSRF and malicious domain attacks', async () => {
    const attackUrls = [
      'http://youtube.com/shorts/clipVid0003', // non-https
      'https://169.254.169.254/latest/meta-data', // AWS metadata IP
      'https://youtube.com.evil.com/shorts/clipVid0003', // Subdomain spoofing
      'https://youtube.com/shorts/short', // Less than 11 chars
      'ftp://youtube.com/shorts/clipVid0003', // Non-https scheme
    ];

    for (const badUrl of attackUrls) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/clips',
        headers: { 'x-user-id': testClipper.id },
        payload: {
          campaignId: activeCampaign.id,
          url: badUrl,
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('URL_UNRECOGNIZED');
    }
  });

  it('automatically registers participant if not joined prior to submitting clip', async () => {
    // Verify participant doesn't exist yet
    const beforePart = await repo.getParticipant(activeCampaign.id, testClipper.id);
    expect(beforePart).toBeNull();

    const res = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: activeCampaign.id,
        url: 'https://youtube.com/shorts/clipAutoPart',
      },
    });

    expect(res.statusCode).toBe(202);
    const afterPart = await repo.getParticipant(activeCampaign.id, testClipper.id);
    expect(afterPart).not.toBeNull();
    expect(afterPart?.verificationCode).toMatch(/^CS-1-[0-9a-f]{6}$/);
  });

  it('handles zero new views on re-verification by deferring without contract call', async () => {
    const clipPublishedAt = new Date(activeCampaign.createdAt.getTime() + 60_000);

    // Create an active clip with 50,000 paid views
    const clip = await repo.createClip({
      onchainId: 10n,
      campaignId: activeCampaign.id,
      clipperId: testClipper.id,
      platform: 'youtube',
      videoId: 'clipZeroD01',
      videoIdHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
      url: 'https://youtube.com/shorts/clipZeroD01',
      verificationCode: 'CS-1-abc123',
      publishedAt: clipPublishedAt,
      durationSec: 45,
      transcript: 'Full matching audio transcript from podcast.',
      transcriptHash: null,
      paidViews: 50000,
      releasedAmount: 10500000n,
      holdbackAmount: 4500000n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: new Date(),
      nextCheckAt: new Date(),
    });

    // YouTube adapter returns 50,000 views (no new views)
    const ytAdapter = new MockYouTubeAdapter();
    ytAdapter.setFixture('clipZeroD01', {
      videoId: 'clipZeroD01',
      title: 'Short',
      description: 'Podcast short CS-1-abc123',
      durationSec: 45,
      views: 50000,
      likes: 2000,
      comments: 100,
      publishedAt: clipPublishedAt,
      channelId: 'channel1',
    });

    const worker = new VerifyClipWorker({
      repo,
      chain,
      youtube: ytAdapter,
    });

    await worker.processClip(clip.id);

    const updated = await repo.getClipById(clip.id);
    expect(updated?.status).toBe('PENDING_VIEWS');
    expect(updated?.rejectionReason).toContain('Belum ada penambahan views baru');
    expect(updated?.paidViews).toBe(50000); // Unchanged
  });

  it('enforces max payout per clip ceiling gracefully without reverting onchain', async () => {
    const clipPublishedAt = new Date(activeCampaign.createdAt.getTime() + 60_000);

    // Max payout is 10,000,000. Clip already has 7,000,000 released + 3,000,000 holdback (total 10,000,000)
    const clip = await repo.createClip({
      onchainId: 11n,
      campaignId: activeCampaign.id,
      clipperId: testClipper.id,
      platform: 'youtube',
      videoId: 'clipMaxPay1',
      videoIdHash: '0x8888888888888888888888888888888888888888888888888888888888888888',
      url: 'https://youtube.com/shorts/clipMaxPay1',
      verificationCode: 'CS-1-beef42',
      publishedAt: clipPublishedAt,
      durationSec: 30,
      transcript: 'Full transcript of the podcast episode discussing artificial intelligence.',
      transcriptHash: null,
      paidViews: 30000,
      releasedAmount: 7000000n,
      holdbackAmount: 3000000n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: new Date(),
      nextCheckAt: new Date(),
    });

    // YouTube reports 100,000 views
    const ytAdapter = new MockYouTubeAdapter();
    ytAdapter.setFixture('clipMaxPay1', {
      videoId: 'clipMaxPay1',
      title: 'Max payout test clip',
      description: 'Podcast short CS-1-beef42',
      durationSec: 30,
      views: 100000,
      likes: 5000,
      comments: 300,
      publishedAt: clipPublishedAt,
      channelId: 'channel1',
    });

    const whisperAdapter = new MockWhisperAdapter();
    const clipTranscript = 'Full transcript of the podcast episode discussing artificial intelligence.';
    whisperAdapter.setTranscript('clipMaxPay1', clipTranscript, [
      { start: 0, end: 30, text: clipTranscript },
    ]);

    const worker = new VerifyClipWorker({
      repo,
      chain,
      youtube: ytAdapter,
      whisper: whisperAdapter,
    });

    await worker.processClip(clip.id);

    const updated = await repo.getClipById(clip.id);
    expect(updated?.status).toBe('ACTIVE');
    expect(updated?.rejectionReason).toBe('Batas maksimum payout per klip tercapai.');
    expect(updated?.nextCheckAt).toBeNull();
  });

  it('calculates claimable holdback based on 72h maturity window', async () => {
    // 1. Clip with holdback not yet unlocked (in 72h future)
    const futureUnlock = new Date(Date.now() + 72 * 3600_000);
    const clip = await repo.createClip({
      onchainId: 12n,
      campaignId: activeCampaign.id,
      clipperId: testClipper.id,
      platform: 'youtube',
      videoId: 'clipHoldback',
      videoIdHash: '0x7777777777777777777777777777777777777777777777777777777777777777',
      url: 'https://youtube.com/shorts/clipHoldback',
      verificationCode: 'CS-1-hold01',
      publishedAt: new Date(Date.now() - 3600_000),
      durationSec: 40,
      transcript: 'Transcript',
      transcriptHash: null,
      paidViews: 20000,
      releasedAmount: 4200000n,
      holdbackAmount: 1800000n,
      holdbackUnlockAt: futureUnlock,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: new Date(),
      nextCheckAt: new Date(),
    });

    // Check detail before maturity
    const resBefore = await app.inject({
      method: 'GET',
      url: `/api/clips/${clip.id}`,
    });
    expect(resBefore.statusCode).toBe(200);
    const bodyBefore = JSON.parse(resBefore.payload);
    expect(bodyBefore.data.totals.holdbackAmount).toBe('1800000');
    expect(bodyBefore.data.totals.claimableNow).toBe('0');

    // 2. Advance time past maturity
    const pastUnlock = new Date(Date.now() - 1000);
    await repo.updateClip(clip.id, {
      holdbackUnlockAt: pastUnlock,
    });

    // Check detail after maturity
    const resAfter = await app.inject({
      method: 'GET',
      url: `/api/clips/${clip.id}`,
    });
    expect(resAfter.statusCode).toBe(200);
    const bodyAfter = JSON.parse(resAfter.payload);
    expect(bodyAfter.data.totals.claimableNow).toBe('1800000');

    // 3. ClaimHoldbackWorker claims the mature holdback
    const claimWorker = new ClaimHoldbackWorker(repo, chain);
    const claimedCount = await claimWorker.runClaim();
    expect(claimedCount).toBe(1);

    const updated = await repo.getClipById(clip.id);
    expect(updated?.holdbackAmount).toBe(0n);
    expect(updated?.releasedAmount).toBe(6000000n); // 4200000 + 1800000
    expect(updated?.holdbackUnlockAt).toBeNull();
  });
});
