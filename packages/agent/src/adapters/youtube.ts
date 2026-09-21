import { keccak256, encodePacked } from 'viem';

export const YOUTUBE_URL_REGEX =
  /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
export const VERIFICATION_CODE_REGEX = /CS-(\d+)-([a-f0-9]{6})/i;

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  description: string;
  publishedAt: Date;
  channelId: string;
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
}

export interface IYouTubeAdapter {
  parseVideoId(url: string): string | null;
  parseVerificationCode(description: string): { campaignId: number; code: string } | null;
  computeVideoIdHash(videoId: string): `0x${string}`;
  getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null>;
}

export class YouTubeAdapter implements IYouTubeAdapter {
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  parseVideoId(url: string): string | null {
    const match = url.trim().match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  }

  parseVerificationCode(description: string): { campaignId: number; code: string } | null {
    const match = description.match(VERIFICATION_CODE_REGEX);
    if (!match) return null;
    return {
      campaignId: parseInt(match[1], 10),
      code: match[2].toLowerCase(),
    };
  }

  computeVideoIdHash(videoId: string): `0x${string}` {
    return keccak256(encodePacked(['string', 'string'], ['youtube', videoId]));
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    if (!this.apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(
      videoId
    )}&key=${encodeURIComponent(this.apiKey)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      items?: Array<{
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
          channelId?: string;
        };
        contentDetails?: {
          duration?: string;
        };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }>;
    };

    if (!data.items || data.items.length === 0) return null;
    const item = data.items[0];
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const content = item.contentDetails || {};

    return {
      videoId,
      title: snippet.title || '',
      description: snippet.description || '',
      publishedAt: new Date(snippet.publishedAt || 0),
      channelId: snippet.channelId || '',
      durationSec: parseIsoDuration(content.duration || 'PT0S'),
      views: parseInt(stats.viewCount || '0', 10),
      likes: parseInt(stats.likeCount || '0', 10),
      comments: parseInt(stats.commentCount || '0', 10),
    };
  }
}

export class MockYouTubeAdapter implements IYouTubeAdapter {
  private readonly fixtures: Map<string, YouTubeVideoDetails> = new Map();

  setFixture(videoId: string, details: YouTubeVideoDetails): void {
    this.fixtures.set(videoId, details);
  }

  parseVideoId(url: string): string | null {
    const match = url.trim().match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  }

  parseVerificationCode(description: string): { campaignId: number; code: string } | null {
    const match = description.match(VERIFICATION_CODE_REGEX);
    if (!match) return null;
    return {
      campaignId: parseInt(match[1], 10),
      code: match[2].toLowerCase(),
    };
  }

  computeVideoIdHash(videoId: string): `0x${string}` {
    return keccak256(encodePacked(['string', 'string'], ['youtube', videoId]));
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    return this.fixtures.get(videoId) || null;
  }
}

function parseIsoDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseInt(match[2] || '0', 10);
  return minutes * 60 + seconds;
}
