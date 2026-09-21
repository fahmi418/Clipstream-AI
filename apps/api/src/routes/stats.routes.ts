import type { FastifyPluginAsync } from 'fastify';
import { getDatabaseRepository } from '../db/client.js';

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/stats', async (_request, reply) => {
    const repo = getDatabaseRepository();
    const campaigns = await repo.listCampaigns();

    let totalBudget = 0n;
    let totalPaidOut = 0n;
    let totalViewsVerified = 0;
    let totalClips = 0;

    for (const c of campaigns) {
      totalBudget += c.totalBudget;
      const clips = await repo.listClipsByCampaign(c.id);
      totalClips += clips.length;
      for (const cl of clips) {
        totalPaidOut += cl.releasedAmount;
        totalViewsVerified += cl.paidViews;
      }
    }

    return reply.status(200).send({
      ok: true,
      data: {
        totalCampaigns: campaigns.length,
        totalClips,
        totalViewsVerified,
        totalBudget: totalBudget.toString(),
        totalPaidOut: totalPaidOut.toString(),
        timestamp: new Date().toISOString(),
      },
    });
  });
};
