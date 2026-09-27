import type { CampaignRecord, StageResult } from '@clipstream/shared';
import type { IYouTubeAdapter, YouTubeVideoDetails } from '../adapters/youtube.js';

export interface OwnershipStageData {
  platform: 'youtube';
  videoId: string;
  videoIdHash: `0x${string}`;
  codeFound: string | null;
  publishedAt: string;
  channelId: string;
  videoDetails?: YouTubeVideoDetails;
}

export async function executeOwnershipStage(
  clipUrl: string,
  campaign: CampaignRecord,
  youtubeAdapter: IYouTubeAdapter
): Promise<StageResult<OwnershipStageData | null>> {
  const startTime = Date.now();

  // 1. Parse video ID
  const videoId = youtubeAdapter.parseVideoId(clipUrl);
  if (!videoId) {
    return {
      stage: 'ownership',
      status: 'FAIL',
      data: null,
      reason: 'Link tidak dikenali. Masukkan link YouTube Shorts atau video YouTube yang valid.',
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Compute video ID hash
  const videoIdHash = youtubeAdapter.computeVideoIdHash(videoId);

  // 3. Fetch video snippet & statistics
  const details = await youtubeAdapter.getVideoDetails(videoId);
  if (!details) {
    return {
      stage: 'ownership',
      status: 'FAIL',
      data: null,
      reason: 'Video tidak ditemukan atau tidak publik.',
      durationMs: Date.now() - startTime,
    };
  }

  // 4. Verify verification code in description
  const parsedCode = youtubeAdapter.parseVerificationCode(details.description);
  if (!parsedCode) {
    return {
      stage: 'ownership',
      status: 'FAIL',
      data: {
        platform: 'youtube',
        videoId,
        videoIdHash,
        codeFound: null,
        publishedAt: details.publishedAt.toISOString(),
        channelId: details.channelId,
        videoDetails: details,
      },
      reason: `Kode verifikasi CS-${campaign?.onchainId ?? campaign?.id ?? 'XXXX'}-xxxxxx tidak ditemukan di deskripsi video. Tambahkan kode verifikasi di deskripsi video YouTube kamu.`,
      durationMs: Date.now() - startTime,
    };
  }

  if (BigInt(parsedCode.campaignId) !== campaign.onchainId) {
    return {
      stage: 'ownership',
      status: 'FAIL',
      data: {
        platform: 'youtube',
        videoId,
        videoIdHash,
        codeFound: `CS-${parsedCode.campaignId}-${parsedCode.code}`,
        publishedAt: details.publishedAt.toISOString(),
        channelId: details.channelId,
        videoDetails: details,
      },
      reason: 'Kode verifikasi milik campaign lain.',
      durationMs: Date.now() - startTime,
    };
  }

  // 5. Check publishedAt >= campaign.createdAt
  if (details.publishedAt.getTime() < campaign.createdAt.getTime()) {
    return {
      stage: 'ownership',
      status: 'FAIL',
      data: {
        platform: 'youtube',
        videoId,
        videoIdHash,
        codeFound: `CS-${parsedCode.campaignId}-${parsedCode.code}`,
        publishedAt: details.publishedAt.toISOString(),
        channelId: details.channelId,
        videoDetails: details,
      },
      reason: 'Video diposting sebelum campaign aktif.',
      durationMs: Date.now() - startTime,
    };
  }

  return {
    stage: 'ownership',
    status: 'PASS',
    data: {
      platform: 'youtube',
      videoId,
      videoIdHash,
      codeFound: `CS-${parsedCode.campaignId}-${parsedCode.code}`,
      publishedAt: details.publishedAt.toISOString(),
      channelId: details.channelId,
      videoDetails: details,
    },
    durationMs: Date.now() - startTime,
  };
}
