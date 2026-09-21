import { z } from 'zod';

export const HexStringSchema = z.string().regex(/^0x[a-fA-F0-9]+$/);
export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const Bytes32Schema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

export const MetricsDataSchema = z.object({
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
  durationSec: z.number().int().nonnegative(),
  fetchedAt: z.string().datetime(),
});

export const ViolationSchema = z.object({
  rule: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  evidence: z.string(),
});

export const BrandSafetyDataSchema = z.object({
  safe: z.boolean(),
  score: z.number().min(0).max(1),
  violations: z.array(ViolationSchema),
  reasoning: z.string(),
});

export const AnomalySignalsSchema = z.object({
  engagementRatio: z.object({ raw: z.number(), normalized: z.number() }),
  velocityZScore: z.object({ raw: z.number(), normalized: z.number() }),
  likeCommentRatio: z.object({ raw: z.number(), normalized: z.number() }),
  accountHistory: z.object({ raw: z.number(), normalized: z.number() }),
});

export const AnomalyDataSchema = z.object({
  score: z.number().min(0).max(1),
  signals: AnomalySignalsSchema,
  note: z.string(),
});

export const EvidenceBundleSchema = z.object({
  version: z.literal('1.0'),
  clipId: z.string().uuid(),
  campaignId: z.number().int().positive(),
  clipper: AddressSchema,
  videoIdHash: Bytes32Schema,
  verifiedAt: z.string().datetime(),
  metrics: MetricsDataSchema,
  stages: z.object({
    ownership: z.object({
      verified: z.boolean(),
      codeFound: z.string().nullable(),
      publishedAt: z.string().datetime(),
    }),
    sourceMatch: z.object({
      score: z.number().min(0).max(1),
      coverage: z.number().min(0).max(1),
      contiguity: z.number().min(0).max(1),
      matchedChunkCount: z.number().int().nonnegative(),
      clipChunkCount: z.number().int().nonnegative(),
      sourceSpan: z
        .object({
          startSec: z.number(),
          endSec: z.number(),
        })
        .nullable(),
    }),
    brandSafety: BrandSafetyDataSchema,
    anomaly: AnomalyDataSchema,
  }),
  scores: z.object({
    sourceMatchBps: z.number().int().min(0).max(10000),
    safetyBps: z.number().int().min(0).max(10000),
    anomalyBps: z.number().int().min(0).max(10000),
  }),
  modelVersions: z.object({
    asr: z.string(),
    embedding: z.string(),
    safety: z.string(),
  }),
  transcriptHash: Bytes32Schema,
});
