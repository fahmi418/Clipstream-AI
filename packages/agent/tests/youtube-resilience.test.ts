import { describe, it, expect } from 'vitest';
import {
  YouTubeAdapter,
  MockYouTubeAdapter,
  YOUTUBE_URL_REGEX,
  VERIFICATION_CODE_REGEX,
} from '../src/adapters/youtube.js';

describe('YouTube Adapter Resilience & Zero-Key Scraper Fallback', () => {
  it('correctly parses various YouTube URL patterns', () => {
    const adapter = new YouTubeAdapter();

    expect(adapter.parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(adapter.parseVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(adapter.parseVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(adapter.parseVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
    expect(adapter.parseVideoId('https://invalid-url.com/video')).toBeNull();
  });

  it('correctly parses verification code format CS-{campaignId}-{code}', () => {
    const adapter = new YouTubeAdapter();

    const match1 = adapter.parseVerificationCode('Klip ini berpartisipasi dalam kampanye CS-12-a1b2c3.');
    expect(match1).toEqual({ campaignId: 12, code: 'a1b2c3' });

    const match2 = adapter.parseVerificationCode('Kode verifikasi: cs-105-ff0011 di baris baru');
    expect(match2).toEqual({ campaignId: 105, code: 'ff0011' });

    const match3 = adapter.parseVerificationCode('Deskripsi tanpa kode apa pun');
    expect(match3).toBeNull();
  });

  it('computes deterministic keccak256 video ID hash', () => {
    const adapter = new YouTubeAdapter();
    const hash = adapter.computeVideoIdHash('dQw4w9WgXcQ');
    expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('MockYouTubeAdapter returns configured fixture details and mock captions', async () => {
    const mock = new MockYouTubeAdapter();
    mock.setFixture('test1234567', {
      videoId: 'test1234567',
      title: 'Video Mock',
      description: 'Deskripsi CS-1-123456',
      publishedAt: new Date(),
      channelId: 'UC123',
      durationSec: 30,
      views: 5000,
      likes: 200,
      comments: 30,
    });
    mock.setMockCaption('test1234567', 'Transkrip caption audio video mock.');

    const details = await mock.getVideoDetails('test1234567');
    expect(details).toBeDefined();
    expect(details?.title).toBe('Video Mock');
    expect(details?.views).toBe(5000);

    const caption = await mock.fetchTranscriptCaptions?.('test1234567');
    expect(caption).toBe('Transkrip caption audio video mock.');
  });
});
