import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  // Handle rate-limit exceeded errors
  if ((error as any)?.error?.code === 'RATE_LIMIT_EXCEEDED' || error.statusCode === 429) {
    const payload = (error as any)?.error
      ? error
      : {
          ok: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: error.message || 'Terlalu banyak permintaan (Rate limit tercapai). Silakan coba lagi.',
          },
        };
    reply.status(429).send(payload);
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      ok: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Validasi input gagal',
        details: error.errors,
      },
    });
    return;
  }

  const message = error.message || 'Terjadi kesalahan sistem';

  if (message === 'URL_UNRECOGNIZED') {
    reply.status(400).send({
      ok: false,
      error: {
        code: 'URL_UNRECOGNIZED',
        message: 'URL tidak valid atau tidak didukung',
      },
    });
    return;
  }

  if (message === 'CAMPAIGN_EXPIRED') {
    reply.status(400).send({
      ok: false,
      error: {
        code: 'CAMPAIGN_EXPIRED',
        message: 'Batas waktu (deadline) kampanye ini telah berakhir',
      },
    });
    return;
  }

  if (message === 'CAMPAIGN_INACTIVE') {
    reply.status(400).send({
      ok: false,
      error: {
        code: 'CAMPAIGN_INACTIVE',
        message: 'Kampanye sedang tidak aktif',
      },
    });
    return;
  }

  if (message === 'NOT_FOUND' || error.statusCode === 404) {
    reply.status(404).send({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource tidak ditemukan',
      },
    });
    return;
  }

  if (message === 'FORBIDDEN' || error.statusCode === 403) {
    reply.status(403).send({
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Akses ditolak',
      },
    });
    return;
  }

  if (message === 'DUPLICATE_VIDEO' || error.statusCode === 409) {
    reply.status(409).send({
      ok: false,
      error: {
        code: 'DUPLICATE_VIDEO',
        message: 'Video ini sudah pernah didaftarkan dalam protokol ClipStream',
      },
    });
    return;
  }

  if (message === 'UNAUTHENTICATED' || error.statusCode === 401) {
    reply.status(401).send({
      ok: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Sesi tidak valid atau belum login',
      },
    });
    return;
  }


  const statusCode = error.statusCode || 500;
  // Do NOT leak raw exception messages to the client in production
  const safeMessage = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : message;
  reply.status(statusCode).send({
    ok: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED',
      message: safeMessage,
    },
  });
}
