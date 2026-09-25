import { describe, it, expect, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { setDatabaseRepository } from '../src/db/client.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';

describe('Auth API Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    setDatabaseRepository(new InMemoryDatabaseRepository());
    app = await buildServer();
  });

  it('POST /api/auth/register registers a new Clipper user and returns JWT token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'clipper1@clipstream.ai',
        password: 'securePassword123',
        role: 'CLIPPER',
        displayName: 'Budi Clipper',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('clipper1@clipstream.ai');
    expect(body.data.user.role).toBe('CLIPPER');
    expect(body.data.user.displayName).toBe('Budi Clipper');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'same@clipstream.ai',
        password: 'password123',
        role: 'BRAND',
      },
    });

    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'same@clipstream.ai',
        password: 'anotherPassword',
        role: 'CLIPPER',
      },
    });

    expect(dupRes.statusCode).toBe(409);
    const body = JSON.parse(dupRes.payload);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('EMAIL_EXISTS');
  });

  it('POST /api/auth/login logs in user and returns JWT', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'brand@tokopedia.com',
        password: 'brandPassword123',
        role: 'BRAND',
        displayName: 'Tokopedia Brand',
      },
    });

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'brand@tokopedia.com',
        password: 'brandPassword123',
      },
    });

    expect(loginRes.statusCode).toBe(200);
    const body = JSON.parse(loginRes.payload);
    expect(body.ok).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.role).toBe('BRAND');

    // Test GET /api/auth/me with Bearer token
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${body.data.token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const meBody = JSON.parse(meRes.payload);
    expect(meBody.ok).toBe(true);
    expect(meBody.data.user.email).toBe('brand@tokopedia.com');
    expect(meBody.data.user.role).toBe('BRAND');
  });

  it('POST /api/auth/wallet-login authenticates and creates wallet user', async () => {
    const walletAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/wallet-login',
      payload: {
        walletAddress,
        role: 'CLIPPER',
        displayName: 'Web3 Pro Clipper',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.isNewUser).toBe(true);
    expect(body.data.user.walletAddress.toLowerCase()).toBe(walletAddress.toLowerCase());
  });

  it('POST /api/auth/session legacy flow backwards compatibility', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/session',
      payload: {
        privyToken: 'did:privy:cm1testuser01',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        displayName: 'Test Clipper',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.data.user.walletAddress).toBe(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    );
  });
});
