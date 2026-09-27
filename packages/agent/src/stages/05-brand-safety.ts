import type { StageResult } from '@clipstream/shared';
import {
  type BrandSafetyOutput,
  type ILlmAdapter,
  sanitize,
} from '../adapters/llm.js';

export interface BrandSafetyStageData extends BrandSafetyOutput {}

export async function executeBrandSafetyStage(
  title: string,
  description: string,
  transcript: string,
  campaignRules: string,
  llmAdapter: ILlmAdapter
): Promise<StageResult<BrandSafetyStageData>> {
  const startTime = Date.now();

  // Sanitize all untrusted user inputs before prompt assembly (TP4)
  const cleanTitle = sanitize(title);
  const cleanDescription = sanitize(description);
  const cleanTranscript = sanitize(transcript);

  let output: BrandSafetyOutput;
  try {
    output = await llmAdapter.evaluateBrandSafety(
      cleanTitle,
      cleanDescription,
      cleanTranscript,
      campaignRules
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'LLM safety evaluation failed';
    return {
      stage: 'brand-safety',
      status: 'ERROR',
      score: 0,
      data: {
        safe: false,
        score: 0,
        violations: [
          {
            rule: 'system_error',
            severity: 'high',
            evidence: message,
          },
        ],
        reasoning: 'Gagal memproses evaluasi keamanan brand karena gangguan sistem.',
      },
      reason: 'Gagal memproses evaluasi keamanan brand.',
      durationMs: Date.now() - startTime,
      modelVersion: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    };
  }

  const hasHighViolation = output.violations.some((v) => v.severity === 'high');
  const hasMediumViolation = output.violations.some((v) => v.severity === 'medium');

  // Rule 1: Any high violation immediately FAILs
  if (hasHighViolation) {
    return {
      stage: 'brand-safety',
      status: 'FAIL',
      score: output.score,
      data: output,
      reason: `Klip melanggar aturan keamanan konten: ${output.reasoning}`,
      durationMs: Date.now() - startTime,
      modelVersion: output.model ?? 'nvidia/nemotron-3.5-lightning-30b-a3b',
    };
  }

  // Rule 2: Any medium violation routes to human review
  if (hasMediumViolation) {
    return {
      stage: 'brand-safety',
      status: 'REVIEW',
      score: output.score,
      data: output,
      reason: `Klip ditinjau oleh tim kami terkait kepatuhan brand: ${output.reasoning}`,
      durationMs: Date.now() - startTime,
      modelVersion: output.model ?? 'nvidia/nemotron-3.5-lightning-30b-a3b',
    };
  }

  // Rule 3: Overall safety score threshold 0.70
  if (output.score < 0.7) {
    return {
      stage: 'brand-safety',
      status: 'FAIL',
      score: output.score,
      data: output,
      reason: `Skor kepatuhan konten di bawah ambang batas (skor ${Math.round(
        output.score * 100
      )}%). ${output.reasoning}`,
      durationMs: Date.now() - startTime,
      modelVersion: output.model ?? 'nvidia/nemotron-3.5-lightning-30b-a3b',
    };
  }

  return {
    stage: 'brand-safety',
    status: 'PASS',
    score: output.score,
    data: output,
    durationMs: Date.now() - startTime,
    modelVersion: output.model ?? 'nvidia/nemotron-3.5-lightning-30b-a3b',
  };
}
