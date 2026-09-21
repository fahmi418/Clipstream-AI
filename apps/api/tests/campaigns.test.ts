import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { setDatabaseRepository, getDatabaseRepository } from '../src/db/client.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import type { UserEntity } from '../src/db/repository.js';

describe('Campaigns API Routes', () => {
  let app: FastifyInstance;
  let testBrand: UserEntity;

  beforeEach(async () => {
    const repo = new InMemoryDatabaseRepository();
    setDatabaseRepository(repo);

    testBrand = await repo.upsertUser({
      privyDid: 'did:privy:brand01',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      displayName: 'Test Brand',
      email: 'brand@test.com',
    });

    app = await buildServer();
  });

  it('creates campaign and computes deterministic onchain args', async () => {
    const deadline = new Date(Date.now() + 86400_000 * 7).toISOString();

    const res = await app.inject({
      method: 'POST',
      url: '/api/campaigns',
      headers: {
        'x-user-id': testBrand.id,
      },
      payload: {
        sourceUrl: 'https://youtube.com/watch?v=sourceVid01',
        title: 'Podcast Bincang Web3',
        description: 'Potong bagian menarik seputar Web3 dan AI agent.',
        rules: 'Wajib tanpa SARA, tanpa promosi skema cepat kaya.',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        cpmRate: '300000',
        totalBudget: '50000000',
        maxPayoutPerClip: '15000000',
        minViews: 1000,
        deadline,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('PREPROCESSING');
    expect(body.data.sourceHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(body.data.rulesHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(body.data.onchainArgs.cpmRate).toBe('300000');
    expect(body.data.onchainArgs.totalBudget).toBe('50000000');
  });

  it('rejects campaign creation if maxPayoutPerClip exceeds totalBudget', async () => {
    const deadline = new Date(Date.now() + 86400_000 * 7).toISOString();

    const res = await app.inject({
      method: 'POST',
      url: '/api/campaigns',
      headers: {
        'x-user-id': testBrand.id,
      },
      payload: {
        sourceUrl: 'https://youtube.com/watch?v=sourceVid01',
        title: 'Invalid Campaign',
        rules: 'Aturan standar kampanye.',
        cpmRate: '300000',
        totalBudget: '10000000',
        maxPayoutPerClip: '20000000', // exceeds budget
        minViews: 1000,
        deadline,
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('joins campaign and returns deterministic verification code CS-{onchainId}-{hash}', async () => {
    const deadline = new Date(Date.now() + 86400_000 * 7).toISOString();
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/campaigns',
      headers: { 'x-user-id': testBrand.id },
      payload: {
        sourceUrl: 'https://youtube.com/watch?v=sourceVid01',
        title: 'Podcast Bincang Web3',
        rules: 'Wajib tanpa SARA, tanpa klaim palsu.',
        cpmRate: '300000',
        totalBudget: '50000000',
        maxPayoutPerClip: '15000000',
        minViews: 1000,
        deadline,
      },
    });
    const campaignId = JSON.parse(createRes.payload).data.campaignId;

    const clipperUser = await getDatabaseRepository().upsertUser({
      privyDid: 'did:privy:clipper01',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      displayName: 'Active Clipper',
      email: null,
    });

    const joinRes = await app.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/join`,
      headers: { 'x-user-id': clipperUser.id },
    });

    expect(joinRes.statusCode).toBe(200);
    const body = JSON.parse(joinRes.payload);
    expect(body.ok).toBe(true);
    expect(body.data.verificationCode).toMatch(/^CS-\d+-[a-f0-9]{6}$/);

    // Repeated join should return the EXACT same verification code
    const secondJoinRes = await app.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/join`,
      headers: { 'x-user-id': clipperUser.id },
    });
    const secondBody = JSON.parse(secondJoinRes.payload);
    expect(secondBody.data.verificationCode).toBe(body.data.verificationCode);
  });
});
