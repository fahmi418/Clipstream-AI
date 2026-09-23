import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { authPlugin } from './plugins/auth.js';
import { errorHandler } from './plugins/error-handler.js';
import { authRoutes } from './routes/auth.routes.js';
import { campaignRoutes } from './routes/campaigns.routes.js';
import { clipRoutes } from './routes/clips.routes.js';
import { clipperRoutes } from './routes/clippers.routes.js';
import { statsRoutes } from './routes/stats.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  });

  // Plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(authPlugin);

  fastify.setErrorHandler(errorHandler);

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
