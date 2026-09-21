import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/health', async (_request, reply) => {
    return reply.status(200).send({
      ok: true,
      data: {
        status: 'HEALTHY',
        version: '1.0.0',
        chain: 'opBNB Testnet (5611) / BSC Testnet (97)',
        timestamp: new Date().toISOString(),
      },
    });
  });
};
