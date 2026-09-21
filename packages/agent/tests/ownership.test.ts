import { describe, it, expect } from 'vitest';
import type { CampaignRecord } from '@clipstream/shared';
import { MockYouTubeAdapter } from '../src/adapters/youtube.js';
import { executeOwnershipStage } from '../src/stages/01-ownership.js';

describe('Stage 1 — Ownership Verification', () => {
  const mockCampaign: CampaignRecord = {
    id: 'campaign-123',
    onchainId: 1n,
    brandId: 'brand-1',
    sourceVideoId: 'src-1',
    title: 'Podcast Bincang Web3',
    rules: 'tanpa sara',
    cpmRate: 300000n,
    totalBudget: 50000000n,
    maxPayoutPerClip: 15000000n,
    minViews: 1000,
    deadline: new Date('2026-10-01T00:00:00Z'),
    sourceHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
    rulesHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    createdAt: new Date('2026-09-01T00:00:00Z'),
  };

  it('rejects invalid YouTube URL format', async () => {
    const adapter = new MockYouTubeAdapter();
    const result = await executeOwnershipStage('https://example.com/not-youtube', mockCampaign, adapter);

    expect(result.status).toBe('FAIL');
    expect(result.reason).toContain('Link tidak dikenali');
  });

  it('rejects when video is not found on YouTube', async () => {
    const adapter = new MockYouTubeAdapter();
    const result = await executeOwnershipStage('https://youtube.com/shorts/dQw4w9WgXcQ', mockCampaign, adapter);

    expect(result.status).toBe('FAIL');
    expect(result.reason).toContain('Video tidak ditemukan');
  });

  it('rejects when verification code is missing from description', async () => {
    const adapter = new MockYouTubeAdapter();
    adapter.setFixture('dQw4w9WgXcQ', {
      videoId: 'dQw4w9WgXcQ',
      title: 'Klip Keren',
      description: 'Ini klip tanpa kode verifikasi sama sekali',
      publishedAt: new Date('2026-09-05T00:00:00Z'),
      channelId: 'UC12345',
      durationSec: 45,
      views: 5000,
      likes: 200,
      comments: 15,
    });

    const result = await executeOwnershipStage('https://youtube.com/shorts/dQw4w9WgXcQ', mockCampaign, adapter);
    expect(result.status).toBe('FAIL');
    expect(result.reason).toContain('Kode verifikasi CS-1-xxxxxx tidak ditemukan');
  });

  it('rejects when verification code belongs to another campaign', async () => {
    const adapter = new MockYouTubeAdapter();
    adapter.setFixture('dQw4w9WgXcQ', {
      videoId: 'dQw4w9WgXcQ',
      title: 'Klip Keren',
      description: 'Cek video ini! Kode: CS-99-a1b2c3',
      publishedAt: new Date('2026-09-05T00:00:00Z'),
      channelId: 'UC12345',
      durationSec: 45,
      views: 5000,
      likes: 200,
      comments: 15,
    });

    const result = await executeOwnershipStage('https://youtube.com/shorts/dQw4w9WgXcQ', mockCampaign, adapter);
    expect(result.status).toBe('FAIL');
    expect(result.reason).toContain('milik campaign lain');
  });

  it('rejects when video was published before campaign creation', async () => {
    const adapter = new MockYouTubeAdapter();
    adapter.setFixture('dQw4w9WgXcQ', {
      videoId: 'dQw4w9WgXcQ',
      title: 'Klip Lawas',
      description: 'Kode: CS-1-a1b2c3',
      publishedAt: new Date('2026-08-01T00:00:00Z'), // Sebelum campaign createdAt (2026-09-01)
      channelId: 'UC12345',
      durationSec: 45,
      views: 5000,
      likes: 200,
      comments: 15,
    });

    const result = await executeOwnershipStage('https://youtube.com/shorts/dQw4w9WgXcQ', mockCampaign, adapter);
    expect(result.status).toBe('FAIL');
    expect(result.reason).toContain('diposting sebelum campaign aktif');
  });

  it('passes when verification code matches and dates are valid', async () => {
    const adapter = new MockYouTubeAdapter();
    adapter.setFixture('dQw4w9WgXcQ', {
      videoId: 'dQw4w9WgXcQ',
      title: 'Klip Valid Podcast',
      description: 'Potongan seru dari podcast teknologi! CS-1-a1b2c3 jangan lupa like & subscribe',
      publishedAt: new Date('2026-09-10T12:00:00Z'),
      channelId: 'UC12345',
      durationSec: 50,
      views: 5000,
      likes: 200,
      comments: 15,
    });

    const result = await executeOwnershipStage('https://youtube.com/shorts/dQw4w9WgXcQ', mockCampaign, adapter);
    expect(result.status).toBe('PASS');
    expect(result.data?.videoId).toBe('dQw4w9WgXcQ');
    expect(result.data?.codeFound).toBe('CS-1-a1b2c3');
  });
});
