import { keccak256, toHex } from 'viem';
import {
  type AttestationMessage,
  type CampaignRecord,
  type ClipRecord,
  type EvidenceBundle,
  ATTESTATION_EXPIRY_SECONDS,
  toBps,
} from '@clipstream/shared';
import type { AgentSigner } from '../signer.js';
import type { OwnershipStageData } from './01-ownership.js';
import type { MetricsStageData } from './02-metrics.js';
import type { SourceMatchStageData } from './04-source-match.js';
import type { BrandSafetyStageData } from './05-brand-safety.js';
import type { AnomalyStageData } from './06-anomaly.js';

export interface SettleInput {
  campaign: CampaignRecord;
  clip: ClipRecord;
  ownership: OwnershipStageData;
  metrics: MetricsStageData;
  transcriptHash: `0x${string}`;
  sourceMatch: SourceMatchStageData;
  brandSafety: BrandSafetyStageData;
  anomaly: AnomalyStageData;
  nonce: bigint;
  agentSigner: AgentSigner;
}

export interface SettleOutput {
  evidenceBundle: EvidenceBundle;
  canonicalJson: string;
  evidenceHash: `0x${string}`;
  attestation: AttestationMessage;
  signature: `0x${string}`;
}

// Canonical deterministic JSON serializer with sorted object keys
export function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const pairs = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalStringify(record[key])}`
  );
  return `{${pairs.join(',')}}`;
}

export async function executeSettleStage(input: SettleInput): Promise<SettleOutput> {
  const verifiedAt = new Date().toISOString();
  const sourceMatchBps = toBps(input.sourceMatch.score);
  const safetyBps = toBps(input.brandSafety.score);
  const anomalyBps = toBps(input.anomaly.score);

  const evidenceBundle: EvidenceBundle = {
    version: '1.0',
    clipId: input.clip.id,
    campaignId: Number(input.campaign.onchainId),
    clipper: input.clip.clipperAddress,
    videoIdHash: input.clip.videoIdHash,
    verifiedAt,
    metrics: {
      views: input.metrics.views,
      likes: input.metrics.likes,
      comments: input.metrics.comments,
      durationSec: input.metrics.durationSec,
      fetchedAt: input.metrics.fetchedAt,
    },
    stages: {
      ownership: {
        verified: input.ownership.codeFound !== null,
        codeFound: input.ownership.codeFound,
        publishedAt: input.ownership.publishedAt,
      },
      sourceMatch: {
        score: input.sourceMatch.score,
        coverage: input.sourceMatch.coverage,
        contiguity: input.sourceMatch.contiguity,
        matchedChunkCount: input.sourceMatch.matchedChunkCount,
        clipChunkCount: input.sourceMatch.clipChunkCount,
        sourceSpan: input.sourceMatch.sourceSpan,
      },
      brandSafety: {
        score: input.brandSafety.score,
        safe: input.brandSafety.safe,
        violations: input.brandSafety.violations,
        reasoning: input.brandSafety.reasoning,
      },
      anomaly: {
        score: input.anomaly.score,
        signals: input.anomaly.signals,
        note: input.anomaly.note,
      },
    },
    scores: {
      sourceMatchBps,
      safetyBps,
      anomalyBps,
    },
    modelVersions: {
      asr: 'whisper-large-v3',
      embedding: 'multilingual-e5-small',
      safety: 'llama-3.1-70b-instruct',
    },
    transcriptHash: input.transcriptHash,
  };

  const canonicalJson = canonicalStringify(evidenceBundle);
  const evidenceHash = keccak256(toHex(canonicalJson));

  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const expiry = nowSec + BigInt(ATTESTATION_EXPIRY_SECONDS);

  const attestation: AttestationMessage = {
    clipId: input.clip.onchainId ? BigInt(input.clip.onchainId) : 1n,
    campaignId: BigInt(input.campaign.onchainId),
    clipper: input.clip.clipperAddress,
    videoIdHash: input.clip.videoIdHash,
    verifiedViews: input.metrics.views,
    sourceMatchBps,
    safetyBps,
    anomalyBps,
    evidenceHash,
    nonce: input.nonce,
    expiry,
  };

  const signature = await input.agentSigner.signAttestation(attestation);

  return {
    evidenceBundle,
    canonicalJson,
    evidenceHash,
    attestation,
    signature,
  };
}
