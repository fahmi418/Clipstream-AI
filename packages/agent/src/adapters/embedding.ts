import type { TranscriptSegment } from './whisper.js';

export const SIM_THRESHOLD = 0.82;
export const PASS_THRESHOLD = 0.72;
export const REVIEW_THRESHOLD = 0.55;

export interface TranscriptChunk {
  idx: number;
  text: string;
  startSec: number;
  endSec: number;
  embedding?: number[];
}

export interface MatchedChunk {
  clipIdx: number;
  srcIdx: number;
  sim: number;
}

export interface SourceMatchResult {
  score: number;
  coverage: number;
  contiguity: number;
  matchedChunks: MatchedChunk[];
  sourceSpan: { startSec: number; endSec: number } | null;
}

export interface IEmbeddingAdapter {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\b(eh|anu|gitu|ya kan|dong|sih|deh|loh|nih)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunkTranscript(
  segments: TranscriptSegment[],
  windowSec = 15,
  overlapSec = 5
): TranscriptChunk[] {
  if (segments.length === 0) return [];

  const chunks: TranscriptChunk[] = [];
  const totalDuration = segments[segments.length - 1].end;
  const stepSec = windowSec - overlapSec;

  let windowStart = 0;
  let chunkIdx = 0;

  while (windowStart < totalDuration) {
    const windowEnd = windowStart + windowSec;
    const windowSegments = segments.filter(
      (s) => s.start < windowEnd && s.end > windowStart
    );

    const chunkText = windowSegments.map((s) => s.text).join(' ');
    const normalized = normalizeText(chunkText);

    if (normalized.length > 0) {
      chunks.push({
        idx: chunkIdx++,
        text: normalized,
        startSec: windowStart,
        endSec: windowEnd,
      });
    }

    windowStart += stepSec;
  }

  return chunks;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Longest Increasing Subsequence (LIS) on integer array
// Used to detect out-of-order clip manipulation (TRD §5.5)
export function calculateLIS(sequence: number[]): number {
  if (sequence.length === 0) return 0;

  const tails: number[] = [];

  for (const num of sequence) {
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] <= num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    if (left === tails.length) {
      tails.push(num);
    } else {
      tails[left] = num;
    }
  }

  return tails.length;
}

export function computeSourceMatch(
  clipChunksWithEmbeddings: TranscriptChunk[],
  sourceChunksWithEmbeddings: TranscriptChunk[]
): SourceMatchResult {
  if (clipChunksWithEmbeddings.length === 0 || sourceChunksWithEmbeddings.length === 0) {
    return {
      score: 0,
      coverage: 0,
      contiguity: 0,
      matchedChunks: [],
      sourceSpan: null,
    };
  }

  const matchedChunks: MatchedChunk[] = [];

  for (const clipChunk of clipChunksWithEmbeddings) {
    if (!clipChunk.embedding) continue;

    let bestSim = 0;
    let bestSrcIdx = -1;

    for (const srcChunk of sourceChunksWithEmbeddings) {
      if (!srcChunk.embedding) continue;
      const sim = cosineSimilarity(clipChunk.embedding, srcChunk.embedding);
      if (sim > bestSim) {
        bestSim = sim;
        bestSrcIdx = srcChunk.idx;
      }
    }

    if (bestSim >= SIM_THRESHOLD && bestSrcIdx !== -1) {
      matchedChunks.push({
        clipIdx: clipChunk.idx,
        srcIdx: bestSrcIdx,
        sim: bestSim,
      });
    }
  }

  const coverage = matchedChunks.length / clipChunksWithEmbeddings.length;
  const srcIndices = matchedChunks.map((m) => m.srcIdx);
  const lisLength = calculateLIS(srcIndices);
  const contiguity = lisLength / Math.max(matchedChunks.length, 1);

  // Weighted score per TRD §5.5: 0.65 * coverage + 0.35 * contiguity
  const rawScore = 0.65 * coverage + 0.35 * contiguity;
  const score = Math.max(0, Math.min(1, Math.round(rawScore * 10000) / 10000));

  let sourceSpan: { startSec: number; endSec: number } | null = null;
  if (matchedChunks.length > 0) {
    const matchedSourceChunks = matchedChunks
      .map((m) => sourceChunksWithEmbeddings.find((s) => s.idx === m.srcIdx))
      .filter((s): s is TranscriptChunk => s !== undefined);

    if (matchedSourceChunks.length > 0) {
      const startSec = Math.min(...matchedSourceChunks.map((s) => s.startSec));
      const endSec = Math.max(...matchedSourceChunks.map((s) => s.endSec));
      sourceSpan = { startSec, endSec };
    }
  }

  return {
    score,
    coverage,
    contiguity,
    matchedChunks,
    sourceSpan,
  };
}

// Deterministic bag-of-words mock embedding adapter for testing without ONNX runtime
export class MockEmbeddingAdapter implements IEmbeddingAdapter {
  private readonly vocab: Map<string, number> = new Map();

  async embed(text: string): Promise<number[]> {
    const words = normalizeText(text).split(/\s+/).filter(Boolean);
    const vector = new Array(64).fill(0);

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash * 31 + word.charCodeAt(i)) % 64;
      }
      vector[hash] += 1;
    }

    // L2 normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map((val) => val / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
