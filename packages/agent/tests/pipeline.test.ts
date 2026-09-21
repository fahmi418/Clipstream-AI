import { describe, it, expect } from 'vitest';
import type { CampaignRecord, ClipRecord, SourceVideoRecord } from '@clipstream/shared';
import { OPBNB_TESTNET_CHAIN_ID } from '@clipstream/shared';
import { MockYouTubeAdapter } from '../src/adapters/youtube.js';
import { MockWhisperAdapter } from '../src/adapters/whisper.js';
import { MockEmbeddingAdapter, chunkTranscript } from '../src/adapters/embedding.js';
import { MockLlmAdapter } from '../src/adapters/llm.js';
import { AgentSigner } from '../src/signer.js';
import { runVerificationPipeline } from '../src/pipeline.js';

describe('AI Verification Agent — End-to-End Pipeline', () => {
  const agentKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const escrowAddr = '0x1234567890123456789012345678901234567890';

  const signer = new AgentSigner(agentKey, {
    chainId: OPBNB_TESTNET_CHAIN_ID,
    verifyingContract: escrowAddr,
  });

  const mockCampaign: CampaignRecord = {
    id: 'campaign-1',
    onchainId: 1n,
    brandId: 'brand-1',
    sourceVideoId: 'src-1',
    title: 'Podcast Bincang Web3',
    rules: 'tanpa sara, tanpa klaim palsu',
    cpmRate: 300000n,
    totalBudget: 50000000n,
    maxPayoutPerClip: 15000000n,
    minViews: 1000,
    deadline: new Date('2026-10-01T00:00:00Z'),
    sourceHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    rulesHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    createdAt: new Date('2026-09-01T00:00:00Z'),
  };

  const mockSourceVideo: SourceVideoRecord = {
    id: 'src-1',
    platform: 'youtube',
    videoId: 'sourceVideo123',
    videoIdHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    title: 'Episode 42: Masa Depan Web3 dan AI di Indonesia',
    durationSec: 1800,
    transcript: 'Halo semua, di episode kali ini kita mendiskusikan inovasi Web3 dan AI agent.',
    transcriptHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
  };

  const mockClip: ClipRecord = {
    id: 'a0000000-0000-0000-0000-000000000001',
    onchainId: 1n,
    campaignId: 'campaign-1',
    clipperId: 'clipper-1',
    clipperAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    videoId: 'clipVideo01',
    videoIdHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    platform: 'youtube',
    paidViews: 0,
    releasedAmount: 0n,
    holdbackAmount: 0n,
    status: 'ACTIVE',
  };

  it('runs complete 7-stage happy path and produces a signed attestation', async () => {
    const yt = new MockYouTubeAdapter();
    yt.setFixture('clipVideo01', {
      videoId: 'clipVideo01',
      title: 'Highlight Web3 AI Episode 42',
      description: 'Potongan seru diskusi Web3! Kode verifikasi: CS-1-abcdef',
      publishedAt: new Date('2026-09-10T10:00:00Z'),
      channelId: 'UC_CLIPPER',
      durationSec: 50,
      views: 12000,
      likes: 650,
      comments: 45,
    });

    const whisper = new MockWhisperAdapter();
    const clipTranscript =
      'Halo semua, di episode kali ini kita mendiskusikan inovasi Web3 dan AI agent secara lengkap dan transparan.';
    whisper.setTranscript('clipVideo01', clipTranscript, [
      { start: 0, end: 25, text: 'Halo semua, di episode kali ini kita mendiskusikan inovasi Web3' },
      { start: 25, end: 50, text: 'dan AI agent secara lengkap dan transparan.' },
    ]);

    const embedding = new MockEmbeddingAdapter();
    const sourceSegments = [
      { start: 0, end: 30, text: 'Halo semua, di episode kali ini kita mendiskusikan inovasi Web3' },
      { start: 30, end: 60, text: 'dan AI agent secara lengkap dan transparan.' },
    ];
    const rawSourceChunks = chunkTranscript(sourceSegments, 15, 5);
    const srcEmbeddings = await embedding.embedBatch(rawSourceChunks.map((c) => c.text));
    const sourceChunks = rawSourceChunks.map((c, i) => ({ ...c, embedding: srcEmbeddings[i] }));

    const llm = new MockLlmAdapter();

    const outcome = await runVerificationPipeline(
      {
        clipUrl: 'https://youtube.com/shorts/clipVideo01',
        campaign: mockCampaign,
        sourceVideo: mockSourceVideo,
        clip: mockClip,
        sourceChunks,
        nextNonce: 101n,
        clipperApprovalRate: 0.9,
      },
      {
        youtube: yt,
        whisper,
        embedding,
        llm,
        signer,
      }
    );

    expect(outcome.status).toBe('SETTLED');
    if (outcome.status === 'SETTLED') {
      expect(outcome.settle.attestation.verifiedViews).toBe(12000);
      expect(outcome.settle.attestation.sourceMatchBps).toBeGreaterThanOrEqual(7200);
      expect(outcome.settle.attestation.safetyBps).toBeGreaterThanOrEqual(7000);
      expect(outcome.settle.attestation.nonce).toBe(101n);
      expect(outcome.settle.signature).toBeDefined();
    }
  });

  it('stops immediately at Stage 1 if verification code is missing', async () => {
    const yt = new MockYouTubeAdapter();
    yt.setFixture('clipVideo01', {
      videoId: 'clipVideo01',
      title: 'Highlight Web3 AI Episode 42',
      description: 'Potongan seru diskusi Web3! Tanpa kode verifikasi',
      publishedAt: new Date('2026-09-10T10:00:00Z'),
      channelId: 'UC_CLIPPER',
      durationSec: 50,
      views: 12000,
      likes: 650,
      comments: 45,
    });

    const whisper = new MockWhisperAdapter();
    const embedding = new MockEmbeddingAdapter();
    const llm = new MockLlmAdapter();

    const outcome = await runVerificationPipeline(
      {
        clipUrl: 'https://youtube.com/shorts/clipVideo01',
        campaign: mockCampaign,
        sourceVideo: mockSourceVideo,
        clip: mockClip,
        sourceChunks: [],
        nextNonce: 102n,
      },
      {
        youtube: yt,
        whisper,
        embedding,
        llm,
        signer,
      }
    );

    expect(outcome.status).toBe('REJECTED');
    if (outcome.status === 'REJECTED') {
      expect(outcome.failedStage).toBe('ownership');
      expect(outcome.reason).toContain('Kode verifikasi');
    }
    // Verifikasi bahwa stage berikutnya tidak dipanggil
    expect(outcome.results.has('metrics')).toBe(false);
    expect(outcome.results.has('transcript')).toBe(false);
  });

  it('stops at Stage 2 if views are below campaign minimum', async () => {
    const yt = new MockYouTubeAdapter();
    yt.setFixture('clipVideo01', {
      videoId: 'clipVideo01',
      title: 'Highlight Web3 AI',
      description: 'Kode: CS-1-abcdef',
      publishedAt: new Date('2026-09-10T10:00:00Z'),
      channelId: 'UC_CLIPPER',
      durationSec: 50,
      views: 500, // < minViews 1000
      likes: 25,
      comments: 2,
    });

    const whisper = new MockWhisperAdapter();
    const embedding = new MockEmbeddingAdapter();
    const llm = new MockLlmAdapter();

    const outcome = await runVerificationPipeline(
      {
        clipUrl: 'https://youtube.com/shorts/clipVideo01',
        campaign: mockCampaign,
        sourceVideo: mockSourceVideo,
        clip: mockClip,
        sourceChunks: [],
        nextNonce: 103n,
      },
      {
        youtube: yt,
        whisper,
        embedding,
        llm,
        signer,
      }
    );

    expect(outcome.status).toBe('DEFERRED');
    if (outcome.status === 'DEFERRED') {
      expect(outcome.deferStage).toBe('metrics');
      expect(outcome.reason).toContain('belum mencapai batas minimum');
    }
    expect(outcome.results.has('transcript')).toBe(false);
  });
});
