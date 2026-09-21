import { describe, it, expect } from 'vitest';
import type { CampaignRecord, ClipRecord } from '@clipstream/shared';
import { executeMetricsStage } from '../src/stages/02-metrics.js';

describe('Stage 2 — Metrics Verification', () => {
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

  const mockClip: ClipRecord = {
    id: 'clip-1',
    onchainId: 1n,
    campaignId: 'campaign-123',
    clipperId: 'clipper-1',
    clipperAddress: '0x1111111111111111111111111111111111111111',
    videoId: 'dQw4w9WgXcQ',
    videoIdHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    platform: 'youtube',
    paidViews: 2000,
    releasedAmount: 420000n,
    holdbackAmount: 180000n,
    status: 'ACTIVE',
  };

  it('routes to REVIEW when clip duration exceeds 180 seconds', async () => {
    const result = await executeMetricsStage(
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Video Panjang',
        description: 'Test',
        publishedAt: new Date(),
        channelId: 'UC123',
        durationSec: 185, // Melebihi 180 detik
        views: 5000,
        likes: 200,
        comments: 20,
      },
      mockCampaign,
      mockClip
    );

    expect(result.status).toBe('REVIEW');
    expect(result.reason).toContain('Durasi klip melebihi batas');
  });

  it('defers when views are below campaign minimum views', async () => {
    const result = await executeMetricsStage(
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Klip Views Sedikit',
        description: 'Test',
        publishedAt: new Date(),
        channelId: 'UC123',
        durationSec: 60,
        views: 800, // minViews adalah 1000
        likes: 50,
        comments: 5,
      },
      mockCampaign,
      { ...mockClip, paidViews: 0 }
    );

    expect(result.status).toBe('DEFER');
    expect(result.reason).toContain('belum mencapai batas minimum');
  });

  it('defers when there are no new views since last milestone', async () => {
    const result = await executeMetricsStage(
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Klip Stagnan',
        description: 'Test',
        publishedAt: new Date(),
        channelId: 'UC123',
        durationSec: 60,
        views: 2000, // sama dengan clip.paidViews (2000)
        likes: 100,
        comments: 10,
      },
      mockCampaign,
      mockClip
    );

    expect(result.status).toBe('DEFER');
    expect(result.reason).toContain('Belum ada penambahan views baru');
  });

  it('passes when views exceed paidViews and meet minimum requirement', async () => {
    const result = await executeMetricsStage(
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Klip Viral Bertambah Views',
        description: 'Test',
        publishedAt: new Date(),
        channelId: 'UC123',
        durationSec: 58,
        views: 7500, // > 2000 paidViews
        likes: 400,
        comments: 35,
      },
      mockCampaign,
      mockClip
    );

    expect(result.status).toBe('PASS');
    expect(result.data.views).toBe(7500);
  });
});
