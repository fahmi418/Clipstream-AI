import type { StageResult } from '@clipstream/shared';
import {
  chunkTranscript,
  computeSourceMatch,
  type IEmbeddingAdapter,
  type SourceMatchResult,
  type TranscriptChunk,
  PASS_THRESHOLD,
  REVIEW_THRESHOLD,
} from '../adapters/embedding.js';
import type { TranscriptSegment } from '../adapters/whisper.js';

export interface SourceMatchStageData extends SourceMatchResult {
  clipChunkCount: number;
  matchedChunkCount: number;
}

export async function executeSourceMatchStage(
  clipSegments: TranscriptSegment[],
  sourceChunks: TranscriptChunk[],
  embeddingAdapter: IEmbeddingAdapter,
  noSpeech = false
): Promise<StageResult<SourceMatchStageData>> {
  const startTime = Date.now();

  if (noSpeech) {
    // If no speech detected in clip, route to manual review
    return {
      stage: 'source-match',
      status: 'REVIEW',
      score: 0.55,
      data: {
        score: 0.55,
        coverage: 0,
        contiguity: 0,
        matchedChunks: [],
        clipChunkCount: 0,
        matchedChunkCount: 0,
        sourceSpan: null,
      },
      reason: 'Tidak terdeteksi suara pada klip. Klip sedang ditinjau manual.',
      durationMs: Date.now() - startTime,
      modelVersion: 'multilingual-e5-small',
    };
  }

  // 1. Chunk clip transcript
  const rawClipChunks = chunkTranscript(clipSegments, 15, 5);
  if (rawClipChunks.length === 0) {
    return {
      stage: 'source-match',
      status: 'FAIL',
      score: 0,
      data: {
        score: 0,
        coverage: 0,
        contiguity: 0,
        matchedChunks: [],
        clipChunkCount: 0,
        matchedChunkCount: 0,
        sourceSpan: null,
      },
      reason: 'Transkrip klip kosong. Pastikan klip memiliki audio yang jelas.',
      durationMs: Date.now() - startTime,
      modelVersion: 'multilingual-e5-small',
    };
  }

  // 2. Embed clip chunks
  const clipTexts = rawClipChunks.map((c) => c.text);
  const clipEmbeddings = await embeddingAdapter.embedBatch(clipTexts);
  const clipChunksWithEmbeddings = rawClipChunks.map((c, i) => ({
    ...c,
    embedding: clipEmbeddings[i],
  }));

  // Ensure source chunks have embeddings
  let preparedSourceChunks = sourceChunks;
  const missingSourceEmbeddings = sourceChunks.some((s) => !s.embedding);
  if (missingSourceEmbeddings) {
    const srcTexts = sourceChunks.map((s) => s.text);
    const srcEmbeddings = await embeddingAdapter.embedBatch(srcTexts);
    preparedSourceChunks = sourceChunks.map((s, i) => ({
      ...s,
      embedding: srcEmbeddings[i],
    }));
  }

  // 3. Compute semantic matching with LIS contiguity
  const matchResult = computeSourceMatch(
    clipChunksWithEmbeddings,
    preparedSourceChunks
  );

  const stageData: SourceMatchStageData = {
    ...matchResult,
    clipChunkCount: clipChunksWithEmbeddings.length,
    matchedChunkCount: matchResult.matchedChunks.length,
  };

  if (matchResult.score >= PASS_THRESHOLD) {
    return {
      stage: 'source-match',
      status: 'PASS',
      score: matchResult.score,
      data: stageData,
      durationMs: Date.now() - startTime,
      modelVersion: 'multilingual-e5-small',
    };
  }

  if (matchResult.score >= REVIEW_THRESHOLD) {
    return {
      stage: 'source-match',
      status: 'REVIEW',
      score: matchResult.score,
      data: stageData,
      reason: 'Klip sedang ditinjau manual.',
      durationMs: Date.now() - startTime,
      modelVersion: 'multilingual-e5-small',
    };
  }

  const scorePct = Math.round(matchResult.score * 100);
  return {
    stage: 'source-match',
    status: 'FAIL',
    score: matchResult.score,
    data: stageData,
    reason: `Klip tidak cocok dengan video sumber campaign (skor ${scorePct}%). Pastikan kamu memotong dari video campaign.`,
    durationMs: Date.now() - startTime,
    modelVersion: 'multilingual-e5-small',
  };
}
