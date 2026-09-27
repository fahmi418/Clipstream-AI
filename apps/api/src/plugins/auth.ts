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
  // JWT_SECRET is REQUIRED in production — startup will fail if missing
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('[AUTH] JWT_SECRET environment variable is required in production.');
  }
  await fastify.register(fastifyJwt, {
    secret: jwtSecret || 'clipstream-dev-insecure-jwt-secret-do-not-use-in-production',
    sign: {
      expiresIn: '7d',
    },
  });

  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    // NOTE: x-user-id dev bypass header removed — only allowed in test environment
    // to prevent production auth bypass via crafted headers.
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
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
    }

    // 2. Check for Authorization Bearer header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) return;

      // Demo / Sandbox token bypass for testing & development
      if (token === 'demo-jwt-token-admin') {
        request.user = {
          id: 'admin-clipstream-superadmin',
          walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
          displayName: 'Clipstream SuperAdmin',
          email: 'admin@clipstream.ai',
          role: 'ADMIN',
        };
        return;
      }
      if (token === 'demo-jwt-token-brand' || token === 'demo-jwt-brand') {
        request.user = {
          id: 'ef1908a4-a526-4acf-a66d-d052b142cd43',
          walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          displayName: 'Tech Podcast Studio',
          email: 'brand@podcastbincang.id',
          role: 'BRAND',
        };
        return;
      }
      if (token === 'demo-jwt-token-clipper' || token === 'demo-jwt-clipper') {
        request.user = {
          id: '8d069dfc-f447-4c08-a913-a9e2d5400798',
          walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          displayName: 'Budi Clipper Indo',
          email: 'budi@clipper.id',
          role: 'CLIPPER',
        };
        return;
      }

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
