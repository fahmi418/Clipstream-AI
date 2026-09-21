import type { StageResult } from '@clipstream/shared';

export interface AnomalySignals {
  engagementRatio: { raw: number; normalized: number };
  velocityZScore: { raw: number; normalized: number };
  likeCommentRatio: { raw: number; normalized: number };
  accountHistory: { raw: number; normalized: number };
}

export interface AnomalyStageData {
  score: number;
  signals: AnomalySignals;
  note: string;
}

export interface AnomalyInput {
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
  comparatorClipsVelocityPerHour?: number[]; // views/hr of other clips in campaign
  clipperApprovalRate?: number; // 0.0 - 1.0, default 0.5 for new clippers
}

export async function executeAnomalyStage(
  input: AnomalyInput
): Promise<StageResult<AnomalyStageData>> {
  const startTime = Date.now();

  const views = Math.max(input.views, 1);
  const likes = input.likes;
  const comments = Math.max(input.comments, 0);

  // 1. Sinyal Engagement Ratio: (likes + comments) / views (normal: 0.02 - 0.12)
  const rawEngagement = (likes + comments) / views;
  let normEngagement = 0;
  if (rawEngagement < 0.005) {
    normEngagement = 1.0; // Sangat mencurigakan (bot view murni tanpa interaksi)
  } else if (rawEngagement < 0.015) {
    normEngagement = 0.7;
  } else if (rawEngagement <= 0.15) {
    normEngagement = 0.0; // Normal organik
  } else {
    normEngagement = 0.2; // Sedikit tinggi tapi masih wajar
  }

  // 2. Sinyal Like to Comment Ratio: likes / max(comments, 1)
  const rawLikeComment = likes / Math.max(comments, 1);
  let normLikeComment = 0;
  if (rawLikeComment > 500) {
    normLikeComment = 1.0;
  } else if (rawLikeComment > 300) {
    normLikeComment = 0.7;
  } else {
    normLikeComment = 0.0;
  }

  // 3. Sinyal Account History: 1 - approvalRate (default 0.5)
  const approvalRate = input.clipperApprovalRate !== undefined ? input.clipperApprovalRate : 0.5;
  const normHistory = Math.max(0, Math.min(1, 1 - approvalRate));

  // 4. Sinyal Velocity Z-Score
  const hoursSincePublished = Math.max(
    (Date.now() - input.publishedAt.getTime()) / (1000 * 3600),
    0.5
  );
  const velocity = views / hoursSincePublished;

  let normVelocity = 0;
  let weightEngagement = 0.35;
  let weightVelocity = 0.30;
  let weightLikeComment = 0.15;
  let weightHistory = 0.20;

  const comparators = input.comparatorClipsVelocityPerHour || [];
  if (comparators.length >= 3) {
    const mean = comparators.reduce((sum, v) => sum + v, 0) / comparators.length;
    const variance =
      comparators.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      comparators.length;
    const stdDev = Math.sqrt(variance) || 1;
    const zScore = (velocity - mean) / stdDev;

    if (zScore > 3.5) {
      normVelocity = 1.0;
    } else if (zScore > 2.0) {
      normVelocity = 0.6;
    } else {
      normVelocity = 0.0;
    }
  } else {
    // Kurang dari 3 pembanding: alihkan bobot velocity secara proporsional (TRD §5.7)
    const factor = 1 / (1 - weightVelocity); // 1 / 0.70 = 1.428
    weightEngagement *= factor;
    weightLikeComment *= factor;
    weightHistory *= factor;
    weightVelocity = 0;
  }

  const weightedScore =
    normEngagement * weightEngagement +
    normVelocity * weightVelocity +
    normLikeComment * weightLikeComment +
    normHistory * weightHistory;

  const score = Math.max(0, Math.min(1, Math.round(weightedScore * 10000) / 10000));

  const stageData: AnomalyStageData = {
    score,
    signals: {
      engagementRatio: { raw: rawEngagement, normalized: normEngagement },
      velocityZScore: { raw: velocity, normalized: normVelocity },
      likeCommentRatio: { raw: rawLikeComment, normalized: normLikeComment },
      accountHistory: { raw: approvalRate, normalized: normHistory },
    },
    note: 'Heuristik; belum dikalibrasi dengan data produksi.',
  };

  return {
    stage: 'anomaly',
    status: 'PASS',
    score,
    data: stageData,
    durationMs: Date.now() - startTime,
    modelVersion: 'anomaly-heuristic-v1',
  };
}
