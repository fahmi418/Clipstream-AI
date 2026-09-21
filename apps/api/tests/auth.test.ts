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

  it('POST /api/auth/session creates a new user session', async () => {
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
    expect(body.data.user.displayName).toBe('Test Clipper');
    expect(body.data.isNewUser).toBe(true);
  });

  it('POST /api/auth/session updates existing user on repeat login', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/session',
      payload: {
        privyToken: 'did:privy:cm1testuser01',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        displayName: 'Original Name',
      },
    });

    const secondRes = await app.inject({
      method: 'POST',
      url: '/api/auth/session',
      payload: {
        privyToken: 'did:privy:cm1testuser01',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        displayName: 'Updated Name',
      },
    });

    expect(secondRes.statusCode).toBe(200);
    const body = JSON.parse(secondRes.payload);
    expect(body.ok).toBe(true);
    expect(body.data.isNewUser).toBe(false);
    expect(body.data.user.displayName).toBe('Updated Name');
  });
});
