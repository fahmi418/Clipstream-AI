import type {
  CampaignRecord,
  ClipRecord,
  SourceVideoRecord,
  StageResult,
} from '@clipstream/shared';
import type { IYouTubeAdapter } from './adapters/youtube.js';
import type { IWhisperAdapter } from './adapters/whisper.js';
import type { IEmbeddingAdapter, TranscriptChunk } from './adapters/embedding.js';
import type { ILlmAdapter } from './adapters/llm.js';
import type { AgentSigner } from './signer.js';
import { executeOwnershipStage, type OwnershipStageData } from './stages/01-ownership.js';
import { executeMetricsStage, type MetricsStageData } from './stages/02-metrics.js';
import { executeTranscriptStage, type TranscriptStageData } from './stages/03-transcript.js';
import { executeSourceMatchStage, type SourceMatchStageData } from './stages/04-source-match.js';
import { executeBrandSafetyStage, type BrandSafetyStageData } from './stages/05-brand-safety.js';
import { executeAnomalyStage, type AnomalyStageData } from './stages/06-anomaly.js';
import { executeSettleStage, type SettleOutput } from './stages/07-settle.js';

export interface PipelineAdapters {
  youtube: IYouTubeAdapter;
  whisper: IWhisperAdapter;
  embedding: IEmbeddingAdapter;
  llm: ILlmAdapter;
  signer: AgentSigner;
}

export type PipelineOutcome =
  | { status: 'SETTLED'; settle: SettleOutput; results: Map<string, StageResult> }
  | { status: 'REJECTED'; failedStage: string; reason: string; results: Map<string, StageResult> }
  | { status: 'NEEDS_REVIEW'; reviewStage: string; reason: string; results: Map<string, StageResult> }
  | { status: 'DEFERRED'; deferStage: string; reason: string; results: Map<string, StageResult> };

export interface PipelineInput {
  clipUrl: string;
  campaign: CampaignRecord;
  sourceVideo: SourceVideoRecord;
  clip: ClipRecord;
  sourceChunks: TranscriptChunk[];
  nextNonce: bigint;
  comparatorClipsVelocityPerHour?: number[];
  clipperApprovalRate?: number;
}

export async function runVerificationPipeline(
  input: PipelineInput,
  adapters: PipelineAdapters
): Promise<PipelineOutcome> {
  const results = new Map<string, StageResult>();

  // ── Stage 1: Ownership ──────────────────────────────────────
  const ownershipRes = await executeOwnershipStage(
    input.clipUrl,
    input.campaign,
    adapters.youtube
  );
  results.set('ownership', ownershipRes);

  if (ownershipRes.status === 'FAIL') {
    return {
      status: 'REJECTED',
      failedStage: 'ownership',
      reason: ownershipRes.reason || 'Ownership check failed',
      results,
    };
  }

  const ownershipData = ownershipRes.data as OwnershipStageData;
  const videoDetails = ownershipData.videoDetails;
  if (!videoDetails) {
    return {
      status: 'REJECTED',
      failedStage: 'ownership',
      reason: 'Data video YouTube tidak tersedia',
      results,
    };
  }

  // ── Stage 2: Metrics ────────────────────────────────────────
  const metricsRes = await executeMetricsStage(
    videoDetails,
    input.campaign,
    input.clip
  );
  results.set('metrics', metricsRes);

  if (metricsRes.status === 'DEFER') {
    return {
      status: 'DEFERRED',
      deferStage: 'metrics',
      reason: metricsRes.reason || 'Syarat view belum terpenuhi',
      results,
    };
  }

  if (metricsRes.status === 'REVIEW') {
    return {
      status: 'NEEDS_REVIEW',
      reviewStage: 'metrics',
      reason: metricsRes.reason || 'Metrik membutuhkan review manual',
      results,
    };
  }

  const metricsData = metricsRes.data;

  // ── Stage 3: Transcript ─────────────────────────────────────
  const transcriptRes = await executeTranscriptStage(
    ownershipData.videoId,
    adapters.whisper
  );
  results.set('transcript', transcriptRes);

  if (transcriptRes.status === 'ERROR') {
    return {
      status: 'NEEDS_REVIEW',
      reviewStage: 'transcript',
      reason: transcriptRes.reason || 'Transkripsi audio gagal',
      results,
    };
  }

  const transcriptData = transcriptRes.data;

  // ── Stage 4: Source Match ───────────────────────────────────
  const sourceMatchRes = await executeSourceMatchStage(
    transcriptData.segments,
    input.sourceChunks,
    adapters.embedding,
    transcriptData.noSpeech
  );
  results.set('sourceMatch', sourceMatchRes);

  if (sourceMatchRes.status === 'FAIL') {
    return {
      status: 'REJECTED',
      failedStage: 'sourceMatch',
      reason: sourceMatchRes.reason || 'Klip tidak cocok dengan video sumber',
      results,
    };
  }

  if (sourceMatchRes.status === 'REVIEW') {
    return {
      status: 'NEEDS_REVIEW',
      reviewStage: 'sourceMatch',
      reason: sourceMatchRes.reason || 'Skor kemiripan sumber membutuhkan review',
      results,
    };
  }

  const sourceMatchData = sourceMatchRes.data;

  // ── Stage 5: Brand Safety ───────────────────────────────────
  const brandSafetyRes = await executeBrandSafetyStage(
    videoDetails.title,
    videoDetails.description,
    transcriptData.fullText,
    {
      title: input.campaign.title,
      description: (input.campaign as any).description,
      rules: input.campaign.rules,
      sourceTitle: input.sourceVideo.title,
    },
    adapters.llm
  );
  results.set('brandSafety', brandSafetyRes);

  if (brandSafetyRes.status === 'FAIL') {
    return {
      status: 'REJECTED',
      failedStage: 'brandSafety',
      reason: brandSafetyRes.reason || 'Konten melanggar aturan brand safety',
      results,
    };
  }

  if (brandSafetyRes.status === 'REVIEW' || brandSafetyRes.status === 'ERROR') {
    return {
      status: 'NEEDS_REVIEW',
      reviewStage: 'brandSafety',
      reason: brandSafetyRes.reason || 'Kepatuhan brand membutuhkan review manual',
      results,
    };
  }

  const brandSafetyData = brandSafetyRes.data;

  // ── Stage 6: Anomaly ────────────────────────────────────────
  const anomalyRes = await executeAnomalyStage({
    views: metricsData.views,
    likes: metricsData.likes,
    comments: metricsData.comments,
    publishedAt: new Date(ownershipData.publishedAt),
    comparatorClipsVelocityPerHour: input.comparatorClipsVelocityPerHour,
    clipperApprovalRate: input.clipperApprovalRate,
  });
  results.set('anomaly', anomalyRes);

  const anomalyData = anomalyRes.data;

  // ── Stage 7: Settle (Attestation & Signature) ───────────────
  const settleOutput = await executeSettleStage({
    campaign: input.campaign,
    clip: input.clip,
    ownership: ownershipData,
    metrics: metricsData,
    transcriptHash: transcriptData.hash,
    sourceMatch: sourceMatchData,
    brandSafety: brandSafetyData,
    anomaly: anomalyData,
    nonce: input.nextNonce,
    agentSigner: adapters.signer,
  });

  return {
    status: 'SETTLED',
    settle: settleOutput,
    results,
  };
}
