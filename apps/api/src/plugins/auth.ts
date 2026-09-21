import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { getDatabaseRepository } from '../db/client.js';

export interface AuthenticatedUser {
  id: string;
  walletAddress: string;
  displayName: string | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', undefined);

  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    // 1. Check for test/dev header
    const testUserId = request.headers['x-user-id'];
    if (typeof testUserId === 'string' && testUserId.length > 0) {
      const repo = getDatabaseRepository();
      const user = await repo.getUserById(testUserId);
      if (user) {
        request.user = {
          id: user.id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
        };
        return;
      }
    }

    // 2. Check for Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // If token is prefixed with "mock:" or "dev:" we resolve directly
      if (token.startsWith('did:privy:')) {
        const repo = getDatabaseRepository();
        const user = await repo.getUserByPrivyDid(token);
        if (user) {
          request.user = {
            id: user.id,
            walletAddress: user.walletAddress,
            displayName: user.displayName,
          };
          return;
        }
      }
    }
  });
};

export const authPlugin = fp(authPluginAsync, {
  name: 'auth-plugin',
});

export function requireAuth(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void {
  if (!request.user) {
    const error = new Error('UNAUTHENTICATED');
    (error as unknown as { statusCode: number }).statusCode = 401;
    done(error);
    return;
  }
  done();
}
