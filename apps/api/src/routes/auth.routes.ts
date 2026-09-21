import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getDatabaseRepository } from '../db/client.js';

const SessionRequestSchema = z.object({
  privyToken: z.string().min(1),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  displayName: z.string().optional(),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/auth/session', async (request, reply) => {
    const parsed = SessionRequestSchema.parse(request.body);
    const repo = getDatabaseRepository();

    // Derive or use token as privyDid
    const privyDid = parsed.privyToken.startsWith('did:privy:')
      ? parsed.privyToken
      : `did:privy:${parsed.privyToken.slice(0, 16)}`;

    const walletAddress =
      parsed.walletAddress ||
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    const existing = await repo.getUserByPrivyDid(privyDid);
    const isNewUser = !existing;

    const user = await repo.upsertUser({
      privyDid,
      walletAddress,
      displayName: parsed.displayName || null,
      email: null,
    });

    return reply.status(200).send({
      ok: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
        },
        isNewUser,
      },
    });
  });
};
