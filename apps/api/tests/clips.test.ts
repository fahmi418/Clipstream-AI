import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { setDatabaseRepository, getDatabaseRepository } from '../src/db/client.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import type { UserEntity, CampaignEntity } from '../src/db/repository.js';

describe('Clips API Routes', () => {
  let app: FastifyInstance;
  let testBrand: UserEntity;
  let testClipper: UserEntity;
  let testCampaign: CampaignEntity;

  beforeEach(async () => {
    const repo = new InMemoryDatabaseRepository();
    setDatabaseRepository(repo);

    testBrand = await repo.upsertUser({
      privyDid: 'did:privy:brand01',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      displayName: 'Test Brand',
      email: null,
    });

    testClipper = await repo.upsertUser({
      privyDid: 'did:privy:clipper01',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      displayName: 'Pro Clipper',
      email: null,
    });

    const src = await repo.createSourceVideo({
      platform: 'youtube',
      videoId: 'sourceVid01',
      videoIdHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      title: 'Podcast Source',
      durationSec: 1800,
      transcript: 'Konten podcast sumber lengkap.',
      transcriptHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      transcriptStatus: 'READY',
    });

    testCampaign = await repo.createCampaign({
      onchainId: 1n,
      brandId: testBrand.id,
      sourceVideoId: src.id,
      title: 'Kampanye Web3 AI',
      rules: 'Rules kampanye tanpa SARA.',
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

    app = await buildServer();
  });

  it('submits a YouTube Shorts clip successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0001',
      },
    });

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.clipId).toBeDefined();
    expect(body.data.status).toBe('SUBMITTED');
    expect(body.data.eventsUrl).toContain('/events');
  });

  it('rejects duplicate video submission across protocol', async () => {
    // First submission
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0001',
      },
    });
    expect(res1.statusCode).toBe(202);

    // Duplicate submission
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0001',
      },
    });

    expect(res2.statusCode).toBe(409);
    const body = JSON.parse(res2.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('DUPLICATE_VIDEO');
  });

  it('rejects malicious or unrecognized URLs (SSRF mitigation)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'http://169.254.169.254/latest/meta-data',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('URL_UNRECOGNIZED');
  });

  it('retrieves clip details with totals and verification stages', async () => {
    const submitRes = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0002',
      },
    });
    const clipId = JSON.parse(submitRes.payload).data.clipId;

    const detailRes = await app.inject({
      method: 'GET',
      url: `/api/clips/${clipId}`,
    });

    expect(detailRes.statusCode).toBe(200);
    const body = JSON.parse(detailRes.payload);
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe(clipId);
    expect(body.data.totals.releasedAmount).toBe('0');
    expect(body.data.totals.holdbackAmount).toBe('0');
  });

  it('allows brand to flag clip and clipper to appeal', async () => {
    const submitRes = await app.inject({
      method: 'POST',
      url: '/api/clips',
      headers: { 'x-user-id': testClipper.id },
      payload: {
        campaignId: testCampaign.id,
        url: 'https://youtube.com/shorts/clipVid0003',
      },
    });
    const clipId = JSON.parse(submitRes.payload).data.clipId;

    // Brand flags clip
    const flagRes = await app.inject({
      method: 'POST',
      url: `/api/clips/${clipId}/flag`,
      headers: { 'x-user-id': testBrand.id },
      payload: {
        reason: 'Klip melanggar rubrik disclaimer kesehatan.',
      },
    });

    expect(flagRes.statusCode).toBe(200);
    const flagBody = JSON.parse(flagRes.payload);
    expect(flagBody.ok).toBe(true);
    expect(flagBody.data.status).toBe('FLAGGED');

    // Clipper appeals
    const appealRes = await app.inject({
      method: 'POST',
      url: `/api/clips/${clipId}/appeal`,
      headers: { 'x-user-id': testClipper.id },
      payload: {
        reason: 'Klip telah menyertakan disclaimer di awal dan tidak melanggar rubrik.',
      },
    });

    expect(appealRes.statusCode).toBe(201);
    const appealBody = JSON.parse(appealRes.payload);
    expect(appealBody.ok).toBe(true);
    expect(appealBody.data.status).toBe('PENDING');
  });
});
