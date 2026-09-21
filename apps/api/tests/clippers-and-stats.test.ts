import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { setDatabaseRepository, getDatabaseRepository } from '../src/db/client.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import { getChainService, MockChainService } from '../src/services/chain.service.js';

describe('Clippers, Stats & Health API Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const repo = new InMemoryDatabaseRepository();
    setDatabaseRepository(repo);
    app = await buildServer();
  });

  it('GET /api/health returns system operational status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('HEALTHY');
    expect(body.data.chain).toContain('opBNB');
  });

  it('GET /api/clippers/:address returns reputation and earnings stats', async () => {
    const clipperAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const chain = getChainService() as MockChainService;
    chain.setClipperApprovalRate(clipperAddress, 0.95);

    const repo = getDatabaseRepository();
    const user = await repo.upsertUser({
      privyDid: 'did:privy:clipper01',
      walletAddress: clipperAddress,
      displayName: 'Elite Clipper',
      email: null,
    });

    await repo.createClip({
      onchainId: 1n,
      campaignId: 'camp-1',
      clipperId: user.id,
      platform: 'youtube',
      videoId: 'clipVid0001',
      videoIdHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      url: 'https://youtube.com/shorts/clipVid0001',
      verificationCode: 'CS-1-abcdef',
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 20000,
      releasedAmount: 14000000n,
      holdbackAmount: 6000000n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: null,
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/clippers/${clipperAddress}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.approvalRate).toBe(0.95);
    expect(body.data.approvalRateBps).toBe(9500);
    expect(body.data.totalClips).toBe(1);
    expect(body.data.totalPaidViews).toBe(20000);
    expect(body.data.totalEarnings).toBe('14000000');
    expect(body.data.activeHoldback).toBe('6000000');
  });

  it('GET /api/stats aggregates total budget and views', async () => {
    const repo = getDatabaseRepository();
    const user = await repo.upsertUser({
      privyDid: 'did:privy:brand01',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      displayName: 'Brand',
      email: null,
    });

    const src = await repo.createSourceVideo({
      platform: 'youtube',
      videoId: 'sourceVid01',
      videoIdHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      title: 'Src',
      durationSec: 60,
      transcript: 'T',
      transcriptHash: null,
      transcriptStatus: 'READY',
    });

    const camp = await repo.createCampaign({
      onchainId: 1n,
      brandId: user.id,
      sourceVideoId: src.id,
      title: 'Camp 1',
      rules: 'Rules',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      cpmRate: 300000n,
      totalBudget: 50000000n,
      maxPayoutPerClip: 15000000n,
      minViews: 1000,
      deadline: new Date(Date.now() + 86400_000),
      sourceHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      rulesHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      status: 'ACTIVE',
      createTxHash: null,
      activatedAt: new Date(),
    });

    await repo.createClip({
      onchainId: 1n,
      campaignId: camp.id,
      clipperId: user.id,
      platform: 'youtube',
      videoId: 'clipVid0001',
      videoIdHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      url: 'https://youtube.com/shorts/clipVid0001',
      verificationCode: 'CS-1-abcdef',
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 5000,
      releasedAmount: 1500000n,
      holdbackAmount: 0n,
      holdbackUnlockAt: null,
      status: 'ACTIVE',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: null,
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/stats',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.totalCampaigns).toBe(1);
    expect(body.data.totalClips).toBe(1);
    expect(body.data.totalViewsVerified).toBe(5000);
    expect(body.data.totalBudget).toBe('50000000');
    expect(body.data.totalPaidOut).toBe('1500000');
  });
});
