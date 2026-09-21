import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getDatabaseRepository } from '../db/client.js';
import { getChainService } from '../services/chain.service.js';
import { CampaignService } from '../services/campaign.service.js';
import { requireAuth } from '../plugins/auth.js';

const CreateCampaignSchema = z
  .object({
    sourceUrl: z.string().url(),
    title: z.string().min(3).max(120),
    description: z.string().max(2000).optional(),
    rules: z.string().min(10).max(2000),
    tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    cpmRate: z.string().regex(/^\d+$/),
    totalBudget: z.string().regex(/^\d+$/),
    maxPayoutPerClip: z.string().regex(/^\d+$/),
    minViews: z.number().int().min(0).max(1_000_000),
    deadline: z.string().datetime(),
  })
  .refine((data) => BigInt(data.maxPayoutPerClip) <= BigInt(data.totalBudget), {
    message: 'Cap per klip tidak boleh melebihi total budget',
    path: ['maxPayoutPerClip'],
  })
  .refine((data) => new Date(data.deadline).getTime() > Date.now() + 3600_000, {
    message: 'Deadline minimal 1 jam dari sekarang',
    path: ['deadline'],
  });

const ListCampaignsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PREPROCESSING', 'READY', 'ACTIVE', 'ENDED', 'CANCELLED']).optional(),
  sort: z.enum(['newest', 'cpm_desc', 'budget_desc', 'ending_soon']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const FinalizeCampaignSchema = z.object({
  onchainId: z.string().regex(/^\d+$/),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
});

export const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  const getService = () =>
    new CampaignService(getDatabaseRepository(), getChainService());

  fastify.get('/api/campaigns', async (request, reply) => {
    const query = ListCampaignsQuerySchema.parse(request.query);
    const service = getService();
    const result = await service.listCampaigns(query);
    return reply.status(200).send({ ok: true, data: result });
  });

  fastify.post(
    '/api/campaigns',
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = CreateCampaignSchema.parse(request.body);
      const service = getService();
      const user = request.user!;

      const result = await service.createCampaign({
        brandId: user.id,
        ...parsed,
      });

      return reply.status(201).send({ ok: true, data: result });
    }
  );

  fastify.get('/api/campaigns/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = getService();
    const campaign = await service.getCampaign(id);
    if (!campaign) {
      return reply.status(404).send({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Campaign tidak ditemukan' },
      });
    }
    return reply.status(200).send({ ok: true, data: campaign });
  });

  fastify.post(
    '/api/campaigns/:id/join',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user!;
      const service = getService();

      const result = await service.joinCampaign(id, user.id);
      return reply.status(200).send({ ok: true, data: result });
    }
  );

  fastify.post(
    '/api/campaigns/:id/finalize',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = FinalizeCampaignSchema.parse(request.body);
      const repo = getDatabaseRepository();
      const campaign = await repo.getCampaignById(id);

      if (!campaign) {
        return reply.status(404).send({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Campaign tidak ditemukan' },
        });
      }

      if (campaign.brandId !== request.user!.id) {
        return reply.status(403).send({
          ok: false,
          error: { code: 'FORBIDDEN', message: 'Hanya brand pembuat yang dapat mengaktifkan kampanye' },
        });
      }

      await repo.updateCampaignStatus(id, 'ACTIVE', BigInt(parsed.onchainId));
      return reply.status(200).send({
        ok: true,
        data: {
          campaignId: id,
          status: 'ACTIVE',
          onchainId: parsed.onchainId,
        },
      });
    }
  );

  fastify.get(
    '/api/campaigns/:id/clips',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const repo = getDatabaseRepository();
      const campaign = await repo.getCampaignById(id);

      if (!campaign) {
        return reply.status(404).send({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Campaign tidak ditemukan' },
        });
      }

      const clips = await repo.listClipsByCampaign(id);
      return reply.status(200).send({ ok: true, data: clips });
    }
  );
};
