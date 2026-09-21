import type { FastifyPluginAsync } from 'fastify';
import { getDatabaseRepository } from '../db/client.js';
import { getChainService } from '../services/chain.service.js';

export const clipperRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/clippers/:address', async (request, reply) => {
    const { address } = request.params as { address: string };
    const repo = getDatabaseRepository();
    const chain = getChainService();

    const user = await repo.getUserByWallet(address);
    const approvalRate = await chain.getClipperApprovalRate(address as `0x${string}`);

    let totalClips = 0;
    let totalPaidViews = 0;
    let totalEarnings = 0n;
    let activeHoldback = 0n;

    if (user) {
      const userClips = await repo.listClipsByClipper(user.id);
      totalClips = userClips.length;
      for (const c of userClips) {
        totalPaidViews += c.paidViews;
        totalEarnings += c.releasedAmount;
        activeHoldback += c.holdbackAmount;
      }
    }

    return reply.status(200).send({
      ok: true,
      data: {
        walletAddress: address.toLowerCase(),
        approvalRate,
        approvalRateBps: Math.round(approvalRate * 10000),
        totalClips,
        totalPaidViews,
        totalEarnings: totalEarnings.toString(),
        activeHoldback: activeHoldback.toString(),
      },
    });
  });
};
