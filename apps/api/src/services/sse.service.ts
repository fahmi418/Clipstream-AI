import type { FastifyReply } from 'fastify';
import type { ClipStatus, StageStatus } from '@clipstream/shared';

export type VerificationEvent =
  | { type: 'stage_start'; stage: string; label: string; at: string }
  | {
    type: 'stage_complete';
    stage: string;
    status: StageStatus;
    score: number | null;
    label: string;
    reason: string | null;
    at: string;
  }
  | {
    type: 'payout';
    grossPayout?: string;
    platformFee?: string;
    platformFeeBps?: number;
    releasedAmount: string;
    holdbackAmount: string;
    holdbackUnlockAt: string;
    txHash: string;
    explorerUrl: string;
    at: string;
  }
  | {
    type: 'rejected';
    stage?: string;
    code: string;
    reason: string;
    suggestion: string;
    at: string;
  }
  | { type: 'deferred'; nextCheckAt: string; reason: string; at: string }
  | { type: 'error'; message: string; at: string }
  | { type: 'done'; finalStatus: ClipStatus; at: string };

type Subscriber = (event: VerificationEvent) => void;

class SseService {
  private subscribers = new Map<string, Set<Subscriber>>();
  private eventHistory = new Map<string, VerificationEvent[]>();

  subscribe(clipId: string, reply: FastifyReply): void {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Replay existing events if any
    const history = this.eventHistory.get(clipId) || [];
    for (const event of history) {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    const subscriber: Subscriber = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      if (
        event.type === 'done' ||
        event.type === 'rejected' ||
        event.type === 'error'
      ) {
        // End stream shortly after terminal event
        setTimeout(() => {
          this.unsubscribe(clipId, subscriber);
          reply.raw.end();
        }, 1000);
      }
    };

    if (!this.subscribers.has(clipId)) {
      this.subscribers.set(clipId, new Set());
    }
    this.subscribers.get(clipId)!.add(subscriber);

    reply.raw.on('close', () => {
      this.unsubscribe(clipId, subscriber);
    });
  }

  broadcast(clipId: string, event: VerificationEvent): void {
    if (!this.eventHistory.has(clipId)) {
      this.eventHistory.set(clipId, []);
    }
    this.eventHistory.get(clipId)!.push(event);

    const subs = this.subscribers.get(clipId);
    if (subs) {
      for (const sub of subs) {
        try {
          sub(event);
        } catch {
          // ignore broken pipe
        }
      }
    }
  }

  private unsubscribe(clipId: string, subscriber: Subscriber): void {
    const subs = this.subscribers.get(clipId);
    if (subs) {
      subs.delete(subscriber);
      if (subs.size === 0) {
        this.subscribers.delete(clipId);
      }
    }
  }

  clear(clipId: string): void {
    this.subscribers.delete(clipId);
    this.eventHistory.delete(clipId);
  }
}

export const sseService = new SseService();
