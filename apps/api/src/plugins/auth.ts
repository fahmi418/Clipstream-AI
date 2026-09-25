import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { getDatabaseRepository } from '../db/client.js';
import type { UserRole } from '../db/repository.js';

export interface AuthenticatedUser {
  id: string;
  walletAddress: string | null;
  displayName: string | null;
  email: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email?: string | null;
      walletAddress?: string | null;
      role?: UserRole;
    };
    user: AuthenticatedUser;
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify) => {
  // Register JWT plugin
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'clipstream-jwt-super-secret-key-production-ready-2026',
    sign: {
      expiresIn: '7d',
    },
  });

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
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
        };
        return;
      }
    }

    // 2. Check for Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) return;

      // Compatibility: If token is a Privy DID
      if (token.startsWith('did:privy:')) {
        const repo = getDatabaseRepository();
        const user = await repo.getUserByPrivyDid(token);
        if (user) {
          request.user = {
            id: user.id,
            walletAddress: user.walletAddress,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
          };
          return;
        }
      }

      // Standard JWT verification
      try {
        const decoded = fastify.jwt.verify<{
          id: string;
          email?: string | null;
          walletAddress?: string | null;
          role?: UserRole;
        }>(token);

        if (decoded && decoded.id) {
          const repo = getDatabaseRepository();
          const user = await repo.getUserById(decoded.id);
          if (user) {
            request.user = {
              id: user.id,
              walletAddress: user.walletAddress,
              displayName: user.displayName,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
              bio: user.bio,
            };
          } else {
            // Fallback to decoded payload
            request.user = {
              id: decoded.id,
              walletAddress: decoded.walletAddress || null,
              displayName: decoded.email ? decoded.email.split('@')[0] : null,
              email: decoded.email || null,
              role: decoded.role || 'CLIPPER',
            };
          }
        }
      } catch {
        // Invalid or expired token - leave request.user undefined
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

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void => {
    if (!request.user) {
      const error = new Error('UNAUTHENTICATED');
      (error as unknown as { statusCode: number }).statusCode = 401;
      done(error);
      return;
    }
    if (!roles.includes(request.user.role)) {
      const error = new Error('FORBIDDEN_ROLE');
      (error as unknown as { statusCode: number }).statusCode = 403;
      done(error);
      return;
    }
    done();
  };
}
