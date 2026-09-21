import type { IDatabaseRepository } from '../db/repository.js';
import type { IYouTubeAdapter } from '@clipstream/agent';
import { MockYouTubeAdapter } from '@clipstream/agent';
import type { VerifyClipWorker } from './verify-clip.worker.js';
import type { VerificationQueueManager } from '../queue.js';

export class PollMetricsWorker {
  constructor(
    private readonly repo: IDatabaseRepository,
    private readonly youtube: IYouTubeAdapter = new MockYouTubeAdapter(),
    private readonly verifyWorker?: VerifyClipWorker,
    private readonly queueManager?: VerificationQueueManager
  ) {}

  async runPoll(): Promise<number> {
    const now = new Date();
    const clips = await this.repo.listClipsDueForMetrics(now, 50);
    let processed = 0;

    for (const clip of clips) {
      try {
        const details = await this.youtube.getVideoDetails(clip.videoId);
        if (!details) continue;

        await this.repo.recordMetricSnapshot({
          clipId: clip.id,
          views: details.views,
          likes: details.likes,
          comments: details.comments,
        });

        // If views increased significantly compared to paid views, trigger verification
        if (details.views > clip.paidViews) {
          if (this.queueManager) {
            await this.queueManager.enqueueClip(clip.id);
          } else if (this.verifyWorker) {
            await this.verifyWorker.processClip(clip.id);
          }
        } else {
          // Push next check forward by 30 mins
          await this.repo.updateClip(clip.id, {
            nextCheckAt: new Date(Date.now() + 1800_000),
          });
        }
        processed++;
      } catch {
        // Continue processing others if single video fails
      }
    }

    return processed;
  }
}
