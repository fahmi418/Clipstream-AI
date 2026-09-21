import { Queue, Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { VerifyClipWorker } from './workers/verify-clip.worker.js';

export interface VerificationJobData {
  clipId: string;
}

export class VerificationQueueManager {
  private queue?: Queue<VerificationJobData>;
  private worker?: Worker<VerificationJobData>;
  private inProcessHandlers: Array<(data: VerificationJobData) => Promise<void>> = [];

  constructor(
    private readonly redisUrl?: string,
    private readonly verifyWorker?: VerifyClipWorker
  ) {
    if (redisUrl && process.env.NODE_ENV !== 'test') {
      try {
        const connection = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          lazyConnect: true,
        });

        this.queue = new Queue<VerificationJobData>('verify-clip-queue', {
          connection,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        });

        if (verifyWorker) {
          this.worker = new Worker<VerificationJobData>(
            'verify-clip-queue',
            async (job: Job<VerificationJobData>) => {
              await verifyWorker.processClip(job.data.clipId);
            },
            {
              connection,
              concurrency: 3, // Target concurrency matching TRD §6.4
            }
          );
        }
      } catch {
        // Fallback to in-process bus
      }
    }
  }

  async enqueueClip(clipId: string): Promise<void> {
    if (this.queue) {
      await this.queue.add(
        'verify-clip',
        { clipId },
        {
          jobId: `clip:${clipId}:${Date.now()}`,
        }
      );
    } else {
      // In-process asynchronous execution
      setImmediate(() => {
        if (this.verifyWorker) {
          this.verifyWorker.processClip(clipId).catch(() => {});
        }
        for (const handler of this.inProcessHandlers) {
          handler({ clipId }).catch(() => {});
        }
      });
    }
  }

  onInProcessJob(handler: (data: VerificationJobData) => Promise<void>): void {
    this.inProcessHandlers.push(handler);
  }

  async close(): Promise<void> {
    if (this.worker) await this.worker.close();
    if (this.queue) await this.queue.close();
  }
}

let activeQueueManager: VerificationQueueManager | null = null;

export function getQueueManager(verifyWorker?: VerifyClipWorker): VerificationQueueManager {
  if (!activeQueueManager) {
    activeQueueManager = new VerificationQueueManager(
      process.env.REDIS_URL,
      verifyWorker
    );
  }
  return activeQueueManager;
}
