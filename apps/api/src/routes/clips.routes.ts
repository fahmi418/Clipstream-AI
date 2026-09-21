import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getDatabaseRepository } from '../db/client.js';
import { getChainService } from '../services/chain.service.js';
import { ClipService } from '../services/clip.service.js';
import { sseService } from '../services/sse.service.js';
import { VerifyClipWorker } from '../workers/verify-clip.worker.js';
import { getQueueManager } from '../queue.js';
import { requireAuth } from '../plugins/auth.js';

const SubmitClipSchema = z.object({
  campaignId: z.string().uuid(),
  url: z.string().url(),
});

const FlagClipSchema = z.object({
  reason: z.string().min(5).max(500),
});

const AppealClipSchema = z.object({
  reason: z.string().min(10).max(1000),
});

let verifyWorkerInstance: VerifyClipWorker | null = null;

export function getVerifyWorker(): VerifyClipWorker {
  if (!verifyWorkerInstance) {
    verifyWorkerInstance = new VerifyClipWorker({
      repo: getDatabaseRepository(),
      chain: getChainService(),
    });
  }
  return verifyWorkerInstance;
}

export function setVerifyWorker(worker: VerifyClipWorker): void {
  verifyWorkerInstance = worker;
}

export const clipRoutes: FastifyPluginAsync = async (fastify) => {
  const getService = () =>
    new ClipService(getDatabaseRepository(), getChainService());

  fastify.post(
    '/api/clips',
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = SubmitClipSchema.parse(request.body);
      const user = request.user!;
      const service = getService();

      const result = await service.submitClip(
        parsed.campaignId,
        user.id,
        parsed.url
      );

      // Trigger background verification via scalable queue
      const queueManager = getQueueManager(getVerifyWorker());
      await queueManager.enqueueClip(result.clipId);

      return reply.status(202).send({ ok: true, data: result });
    }
  );

  fastify.get('/api/clips/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = getService();

    try {
      const detail = await service.getClipDetail(id);
      return reply.status(200).send({ ok: true, data: detail });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        return reply.status(404).send({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Klip tidak ditemukan' },
        });
      }
      throw err;
    }
  });

  fastify.get('/api/clips/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };
    const repo = getDatabaseRepository();
    const clip = await repo.getClipById(id);

    if (!clip) {
      return reply.status(404).send({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Klip tidak ditemukan' },
      });
    }

    sseService.subscribe(id, reply);
  });

  fastify.post(
    '/api/clips/:id/flag',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = FlagClipSchema.parse(request.body);
      const user = request.user!;
      const service = getService();

      const updated = await service.flagClip(id, user.id, parsed.reason);
      return reply.status(200).send({
        ok: true,
        data: {
          clipId: updated.id,
          status: updated.status,
          reason: updated.rejectionReason,
        },
      });
    }
  );

  fastify.post(
    '/api/clips/:id/appeal',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = AppealClipSchema.parse(request.body);
      const user = request.user!;
      const service = getService();

      await service.appealClip(id, user.id, parsed.reason);
      return reply.status(201).send({
        ok: true,
        data: {
          clipId: id,
          status: 'PENDING',
        },
      });
    }
  );
};
