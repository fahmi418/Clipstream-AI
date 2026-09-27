import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { authPlugin } from './plugins/auth.js';
import { errorHandler } from './plugins/error-handler.js';
import { authRoutes } from './routes/auth.routes.js';
import { campaignRoutes } from './routes/campaigns.routes.js';
import { clipRoutes } from './routes/clips.routes.js';
import { clipperRoutes } from './routes/clippers.routes.js';
import { statsRoutes } from './routes/stats.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { seedDemoData } from './db/seed.js';

// Auto-load .env file if available in Node 20+
if (typeof process.loadEnvFile === 'function') {
  const currentDir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));
  const candidateEnvs = [
    resolve(currentDir, '../.env'),
    resolve(currentDir, '../../.env'),
    resolve(process.cwd(), 'apps/api/.env'),
    resolve(process.cwd(), '.env'),
  ];
  for (const envPath of candidateEnvs) {
    if (existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
        break;
      } catch {
        // continue
      }
    }
  }
}

// Enable JSON serialization of BigInt values
if (!('toJSON' in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  });

  // Plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Enterprise Rate Limiting Protection (DDoS & AI Endpoint Quota Shield)
  await fastify.register(rateLimit, {
    max: 120, // 120 requests per minute
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      ok: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Terlalu banyak permintaan (Rate limit tercapai). Silakan coba lagi dalam ${Math.ceil(context.ttl / 1000)} detik.`,
        retryAfter: Math.ceil(context.ttl / 1000),
      },
    }),
  });

  await fastify.register(authPlugin);

  fastify.setErrorHandler(errorHandler);

  // Auto-seed in-memory demo data in non-test mode
  if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    try {
      await seedDemoData();
    } catch {
      // Ignore if already seeded
    }
  }

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(campaignRoutes);
  await fastify.register(clipRoutes);
  await fastify.register(clipperRoutes);
  await fastify.register(statsRoutes);
  await fastify.register(adminRoutes);

  return fastify;
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  buildServer()
    .then((server) => {
      server.listen({ port, host }, (err, address) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(`Server listening on ${address}`);
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
