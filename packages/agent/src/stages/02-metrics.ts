import type { CampaignRecord, ClipRecord, StageResult } from '@clipstream/shared';
import type { YouTubeVideoDetails } from '../adapters/youtube.js';

export interface MetricsStageData {
  views: number;
  likes: number;
  comments: number;
  durationSec: number;
  fetchedAt: string;
}

export async function executeMetricsStage(
  videoDetails: YouTubeVideoDetails,
  campaign: CampaignRecord,
  clip: ClipRecord
): Promise<StageResult<MetricsStageData>> {
  const startTime = Date.now();

  const metricsData: MetricsStageData = {
    views: videoDetails.views,
    likes: videoDetails.likes,
    comments: videoDetails.comments,
    durationSec: videoDetails.durationSec,
    fetchedAt: new Date().toISOString(),
  };

  // Rule 5: Duration limit max 180 seconds (3 minutes)
  if (videoDetails.durationSec > 180) {
    return {
      stage: 'metrics',
      status: 'REVIEW',
      data: metricsData,
      reason: 'Durasi klip melebihi batas maksimal 180 detik.',
      durationMs: Date.now() - startTime,
    };
  }

  // Rule 3: Must meet minimum views requirement
  if (videoDetails.views < campaign.minViews) {
    return {
      stage: 'metrics',
      status: 'DEFER',
      data: metricsData,
      reason: `Jumlah views (${videoDetails.views.toLocaleString()}) belum mencapai batas minimum kampanye (${campaign.minViews.toLocaleString()}).`,
      durationMs: Date.now() - startTime,
    };
  }

  // Rule 4: Views must strictly increase over already paid views
  if (videoDetails.views <= clip.paidViews) {
    return {
      stage: 'metrics',
      status: 'DEFER',
      data: metricsData,
      reason: `Belum ada penambahan views baru dari milestone sebelumnya (${clip.paidViews.toLocaleString()}).`,
      durationMs: Date.now() - startTime,
    };
  }

  return {
    stage: 'metrics',
    status: 'PASS',
    data: metricsData,
    durationMs: Date.now() - startTime,
  };
}
