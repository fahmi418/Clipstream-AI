import { describe, it, expect } from 'vitest';
import { executeAnomalyStage } from '../src/stages/06-anomaly.js';

describe('Stage 6 — Anomaly & Bot View Scoring', () => {
  it('gives low anomaly score for healthy organic engagement', async () => {
    const result = await executeAnomalyStage({
      views: 10000,
      likes: 600, // 6% engagement
      comments: 50,
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000), // 24 jam lalu
      clipperApprovalRate: 0.95, // Clipper bereputasi tinggi
    });

    expect(result.status).toBe('PASS');
    expect(result.score).toBeLessThan(0.45); // Holdback normal 30%
    expect(result.data.signals.engagementRatio.normalized).toBe(0.0);
  });

  it('elevates anomaly score when engagement is suspiciously low (bot views)', async () => {
    const result = await executeAnomalyStage({
      views: 50000,
      likes: 5, // 0.01% engagement (indikasi bot views tajam)
      comments: 0,
      publishedAt: new Date(Date.now() - 10 * 3600 * 1000),
      clipperApprovalRate: 0.3,
    });

    expect(result.status).toBe('PASS');
    // Engagement ratio 1.0 (bobot 0.35+) + likeComment 1.0 + low approval
    expect(result.score).toBeGreaterThanOrEqual(0.45);
    expect(result.data.signals.engagementRatio.normalized).toBe(1.0);
  });

  it('shifts velocity weight when comparator clips are fewer than 3', async () => {
    // Only 1 comparator provided -> weight shifted proportionally
    const result = await executeAnomalyStage({
      views: 10000,
      likes: 500,
      comments: 40,
      publishedAt: new Date(Date.now() - 5 * 3600 * 1000),
      comparatorClipsVelocityPerHour: [1500], // < 3 pembanding
      clipperApprovalRate: 0.8,
    });

    expect(result.data.signals.velocityZScore.normalized).toBe(0);
    expect(result.score).toBeLessThan(0.45);
  });

  it('detects extreme velocity anomaly (z-score > 3.5) with comparator baseline', async () => {
    // Campaign average ~ 500 views/hr
    const baseline = [450, 520, 480, 510, 490];

    // Current clip has 30,000 views in 1 hour -> velocity 30,000/hr (z-score >> 3.5)
    const result = await executeAnomalyStage({
      views: 30000,
      likes: 200,
      comments: 10,
      publishedAt: new Date(Date.now() - 1 * 3600 * 1000),
      comparatorClipsVelocityPerHour: baseline,
      clipperApprovalRate: 0.5,
    });

    expect(result.data.signals.velocityZScore.normalized).toBe(1.0);
    expect(result.score).toBeGreaterThanOrEqual(0.45);
  });
});
