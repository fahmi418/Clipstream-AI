import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  calculateLIS,
  cosineSimilarity,
  chunkTranscript,
  computeSourceMatch,
  MockEmbeddingAdapter,
} from '../src/adapters/embedding.js';
import { executeSourceMatchStage } from '../src/stages/04-source-match.js';

describe('Stage 4 — Source Matching & LIS Contiguity', () => {
  it('normalizes Indonesian text and removes filler words', () => {
    const raw = 'Eh, jadi gitu ya kan... teknologi blockchain itu, anu, sangat terdesentralisasi deh!';
    const normalized = normalizeText(raw);
    expect(normalized).toBe('jadi teknologi blockchain itu sangat terdesentralisasi');
    expect(normalized).not.toContain('eh');
    expect(normalized).not.toContain('anu');
    expect(normalized).not.toContain('gitu');
    expect(normalized).not.toContain('ya kan');
    expect(normalized).not.toContain('deh');
  });

  it('calculates Longest Increasing Subsequence (LIS) accurately', () => {
    // Strictly increasing: [1, 2, 4, 7] -> length 4
    expect(calculateLIS([1, 2, 4, 7])).toBe(4);

    // Mixed out of order: [3, 1, 4, 1, 5, 9, 2, 6] -> LIS is [1, 4, 5, 9] (len 4) or [1, 4, 5, 6] (len 4)
    expect(calculateLIS([3, 1, 4, 1, 5, 9, 2, 6])).toBe(4);

    // Completely reversed: [5, 4, 3, 2, 1] -> LIS length 1
    expect(calculateLIS([5, 4, 3, 2, 1])).toBe(1);

    // Empty array
    expect(calculateLIS([])).toBe(0);
  });

  it('calculates cosine similarity correctly', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];

    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0, 5);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0.0, 5);
  });

  it('chunks transcript into overlapping windows', () => {
    const segments = [
      { start: 0, end: 10, text: 'Halo semua selamat datang' },
      { start: 10, end: 20, text: 'Hari ini kita bahas smart contract' },
      { start: 20, end: 35, text: 'Escrow pada blockchain BNB Chain sangat cepat dan murah' },
    ];

    const chunks = chunkTranscript(segments, 15, 5);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].startSec).toBe(0);
    expect(chunks[0].endSec).toBe(15);
  });

  it('passes in-order clip taken directly from source video', async () => {
    const adapter = new MockEmbeddingAdapter();

    const sourceSegments = [
      { start: 0, end: 15, text: 'Teknologi kecerdasan buatan dan blockchain adalah masa depan Web3' },
      { start: 15, end: 30, text: 'Dengan verifikasi onchain semua proses escrow menjadi transparan' },
      { start: 30, end: 45, text: 'Clipper mendapatkan imbalan instan sesuai performa views mereka' },
      { start: 45, end: 60, text: 'Semua dicatat di BNB Chain testnet secara akurat dan terpercaya' },
    ];

    const clipSegments = [
      { start: 0, end: 15, text: 'Teknologi kecerdasan buatan dan blockchain adalah masa depan Web3' },
      { start: 15, end: 30, text: 'Dengan verifikasi onchain semua proses escrow menjadi transparan' },
      { start: 30, end: 45, text: 'Clipper mendapatkan imbalan instan sesuai performa views mereka' },
    ];

    const rawSourceChunks = chunkTranscript(sourceSegments, 15, 5);
    const srcEmbeddings = await adapter.embedBatch(rawSourceChunks.map((c) => c.text));
    const sourceChunksWithEmbeddings = rawSourceChunks.map((c, i) => ({
      ...c,
      embedding: srcEmbeddings[i],
    }));

    const result = await executeSourceMatchStage(
      clipSegments,
      sourceChunksWithEmbeddings,
      adapter
    );

    expect(result.status).toBe('PASS');
    expect(result.score).toBeGreaterThanOrEqual(0.72);
    expect(result.data.contiguity).toBe(1.0); // Urutan sama persis
    expect(result.data.coverage).toBeGreaterThanOrEqual(0.8);
  });

  it('penalizes out-of-order shuffled clips with lower contiguity score', async () => {
    const adapter = new MockEmbeddingAdapter();

    const sourceChunks = [
      { idx: 0, text: 'satu pembukaan podcast pengenalan topik', startSec: 0, endSec: 15 },
      { idx: 1, text: 'dua pembahasan inti fitur teknologi', startSec: 15, endSec: 30 },
      { idx: 2, text: 'tiga kesimpulan dan saran penonton', startSec: 30, endSec: 45 },
    ];

    const srcEmbeddings = await adapter.embedBatch(sourceChunks.map((c) => c.text));
    const preparedSource = sourceChunks.map((c, i) => ({ ...c, embedding: srcEmbeddings[i] }));

    // Klip membalik urutan: chunk 2 dulu, lalu chunk 1, lalu chunk 0
    // [2, 1, 0] -> LIS length adalah 1 dari 3 chunk -> contiguity = 1/3 = 0.33!
    const clipChunksReversed = [
      { idx: 0, text: 'tiga kesimpulan dan saran penonton', startSec: 0, endSec: 15, embedding: preparedSource[2].embedding },
      { idx: 1, text: 'dua pembahasan inti fitur teknologi', startSec: 15, endSec: 30, embedding: preparedSource[1].embedding },
      { idx: 2, text: 'satu pembukaan podcast pengenalan topik', startSec: 30, endSec: 45, embedding: preparedSource[0].embedding },
    ];

    const matchResult = computeSourceMatch(clipChunksReversed, preparedSource);

    // Coverage 1.0, tapi contiguity anjlok ke 0.333!
    expect(matchResult.coverage).toBe(1.0);
    expect(matchResult.contiguity).toBeCloseTo(1 / 3, 2);
    // Score = 0.65 * 1.0 + 0.35 * 0.333 = 0.7667 (terpangkas signifikan dibanding 1.0)
    expect(matchResult.score).toBeLessThan(0.8);
  });

  it('fails completely unrelated clip', async () => {
    const adapter = new MockEmbeddingAdapter();

    const sourceSegments = [
      { start: 0, end: 30, text: 'Diskusi mendalam tentang arsitektur blockchain Binance Smart Chain' },
    ];
    const clipSegments = [
      { start: 0, end: 30, text: 'Resep cara memasak nasi goreng lezat bumbu kecap manis pedas' },
    ];

    const rawSourceChunks = chunkTranscript(sourceSegments, 15, 5);
    const srcEmbeddings = await adapter.embedBatch(rawSourceChunks.map((c) => c.text));
    const sourceChunksWithEmbeddings = rawSourceChunks.map((c, i) => ({
      ...c,
      embedding: srcEmbeddings[i],
    }));

    const result = await executeSourceMatchStage(
      clipSegments,
      sourceChunksWithEmbeddings,
      adapter
    );

    expect(result.status).toBe('FAIL');
    expect(result.score).toBeLessThan(0.55);
    expect(result.reason).toContain('Klip tidak cocok');
  });
});
