import { z } from 'zod';

export interface Violation {
  rule: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
}

export interface BrandSafetyOutput {
  safe: boolean;
  score: number;
  violations: Violation[];
  reasoning: string;
}

export interface ILlmAdapter {
  evaluateBrandSafety(
    title: string,
    description: string,
    transcript: string,
    campaignRules: string
  ): Promise<BrandSafetyOutput>;
}

export function sanitize(s: string): string {
  return s
    .replace(/<\/?(content|rules|title|description|transcript)>/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .slice(0, 8000);
}

const OutputSchema = z.object({
  safe: z.boolean(),
  score: z.number().min(0).max(1),
  violations: z.array(
    z.object({
      rule: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      evidence: z.string(),
    })
  ),
  reasoning: z.string(),
});

export class MockLlmAdapter implements ILlmAdapter {
  private cannedResponse?: BrandSafetyOutput;

  setCannedResponse(resp: BrandSafetyOutput): void {
    this.cannedResponse = resp;
  }

  async evaluateBrandSafety(
    title: string,
    description: string,
    transcript: string,
    campaignRules: string
  ): Promise<BrandSafetyOutput> {
    if (this.cannedResponse) {
      return this.cannedResponse;
    }

    const combinedText = `${title} ${description} ${transcript}`.toLowerCase();
    const violations: Violation[] = [];

    // Prompt injection check (TP4 defense)
    if (
      /ignore previous instructions|you are now|system:|forget all prior/i.test(
        combinedText
      )
    ) {
      violations.push({
        rule: 'prompt_manipulation',
        severity: 'high',
        evidence: 'Upaya manipulasi instruksi sistem terdeteksi dalam konten.',
      });
    }

    // R1: SARA
    if (/hina ras|hina agama|anti suku/i.test(combinedText)) {
      violations.push({
        rule: 'R1_hate_speech',
        severity: 'high',
        evidence: 'Ditemukan ujaran kebencian terhadap kelompok tertentu.',
      });
    }

    // R2: Seksual eksplisit
    if (/bokep|pornografi|konten 18\+/i.test(combinedText)) {
      violations.push({
        rule: 'R2_explicit_content',
        severity: 'high',
        evidence: 'Ditemukan konten seksual eksplisit.',
      });
    }

    // R3: Hoax medis / finansial
    if (/pasti kaya cepat 100%|obat segala kanker instan/i.test(combinedText)) {
      violations.push({
        rule: 'R3_misleading_claims',
        severity: 'medium',
        evidence: 'Klaim finansial atau medis yang tidak berdasar.',
      });
    }

    // Custom campaign rules check
    if (campaignRules && campaignRules.includes('tanpa-kompetitor')) {
      if (/brand x|merk pesaing/i.test(combinedText)) {
        violations.push({
          rule: 'campaign_rule_competitor',
          severity: 'medium',
          evidence: 'Menyebutkan brand kompetitor yang dilarang aturan kampanye.',
        });
      }
    }

    const hasHigh = violations.some((v) => v.severity === 'high');
    const hasMedium = violations.some((v) => v.severity === 'medium');

    let score = 0.95;
    if (hasHigh) {
      score = 0.2;
    } else if (hasMedium) {
      score = 0.65;
    }

    const safe = !hasHigh && score >= 0.7;
    const reasoning = violations.length === 0
      ? 'Konten memenuhi semua kriteria keamanan brand dan aturan kampanye.'
      : violations.map((v) => `${v.rule} (${v.severity}): ${v.evidence}`).join('; ');

    return {
      safe,
      score,
      violations,
      reasoning,
    };
  }
}
