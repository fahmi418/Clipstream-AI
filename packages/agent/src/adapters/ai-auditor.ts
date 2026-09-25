import { z } from 'zod';
import type { ILlmAdapter, BrandSafetyOutput, Violation } from './llm.js';
import type { YouTubeVideoDetails } from './youtube.js';
import { VERIFICATION_CODE_REGEX } from './youtube.js';

export interface VideoMetadataInput {
  videoId: string;
  title: string;
  description: string;
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
  publishedAt?: Date | string;
  channelId?: string;
  authorName?: string;
}

export interface CampaignRulesInput {
  campaignId: number;
  title: string;
  rules: string;
  minViews?: number;
  cpmRate?: string;
  brandName?: string;
}

export interface ToolInspectionFinding {
  tool: 'inspect_metadata' | 'inspect_content_safety' | 'verify_brand_rules';
  passed: boolean;
  score: number;
  summary: string;
  details: Record<string, any>;
  violations: Violation[];
}

export interface AiAuditorResult {
  isApproved: boolean;
  overallScore: number;
  safetyScore: number;
  metadataScore: number;
  brandAlignmentScore: number;
  confidence: number;
  suggestedAction: 'APPROVE' | 'REJECT' | 'NEEDS_REVIEW';
  summary: string;
  reasoning: string;
  violations: Violation[];
  findings: ToolInspectionFinding[];
  metadataSummary: {
    videoId: string;
    title: string;
    authorName?: string;
    durationSec: number;
    views: number;
    likes: number;
    comments: number;
    codeFound: boolean;
    extractedCode?: string;
    campaignIdMatched: boolean;
  };
  auditTimestamp: string;
  providerUsed?: string;
}

// ── Tool 1: Inspect Metadata ──
export function toolInspectMetadata(
  video: VideoMetadataInput,
  campaign: CampaignRulesInput
): ToolInspectionFinding {
  const violations: Violation[] = [];
  const findings: string[] = [];

  // 1. Check verification code in description
  const match = video.description.match(VERIFICATION_CODE_REGEX);
  const codeFound = Boolean(match);
  let campaignIdMatched = false;
  let extractedCode: string | undefined;

  if (match) {
    const parsedCampaignId = parseInt(match[1], 10);
    extractedCode = `CS-${match[1]}-${match[2]}`;
    campaignIdMatched = parsedCampaignId === campaign.campaignId;

    if (!campaignIdMatched) {
      violations.push({
        rule: 'invalid_campaign_code',
        severity: 'high',
        evidence: `Kode pada deskripsi (${extractedCode}) tidak sesuai dengan ID Kampanye target (#${campaign.campaignId}).`,
      });
    } else {
      findings.push(`Kode verifikasi kepemilikan valid terdeteksi: ${extractedCode}`);
    }
  } else {
    violations.push({
      rule: 'missing_verification_code',
      severity: 'high',
      evidence: `Kode verifikasi kepemilikan (format CS-${campaign.campaignId}-xxxxxx) tidak ditemukan dalam deskripsi video.`,
    });
  }

  // 2. Check minimum duration for short clips (min 5 seconds)
  if (video.durationSec > 0 && video.durationSec < 5) {
    violations.push({
      rule: 'duration_too_short',
      severity: 'medium',
      evidence: `Durasi video terlalu pendek (${video.durationSec} detik). Minimal 5 detik.`,
    });
  }

  // 3. Check view count against campaign requirements
  const minViews = campaign.minViews || 0;
  if (minViews > 0 && video.views < minViews) {
    findings.push(`Jumlah view (${video.views.toLocaleString()}) saat ini masih di bawah syarat (${minViews.toLocaleString()}).`);
  } else {
    findings.push(`Jumlah view (${video.views.toLocaleString()}) telah memenuhi syarat.`);
  }

  const hasHigh = violations.some((v) => v.severity === 'high');
  const hasMedium = violations.some((v) => v.severity === 'medium');

  let score = 1.0;
  if (hasHigh) score = 0.1;
  else if (hasMedium) score = 0.6;

  return {
    tool: 'inspect_metadata',
    passed: !hasHigh,
    score,
    summary: hasHigh
      ? 'Pemeriksaan metadata gagal: Kode kepemilikan tidak valid.'
      : 'Metadata video dan kode kepemilikan terverifikasi.',
    details: {
      videoId: video.videoId,
      views: video.views,
      durationSec: video.durationSec,
      codeFound,
      campaignIdMatched,
      extractedCode,
    },
    violations,
  };
}

// ── Tool 2: Inspect Content Safety ──
export async function toolInspectContentSafety(
  video: VideoMetadataInput,
  transcript: string,
  campaignRules: string,
  llm: ILlmAdapter
): Promise<ToolInspectionFinding> {
  const safetyOutput: BrandSafetyOutput = await llm.evaluateBrandSafety(
    video.title,
    video.description,
    transcript,
    campaignRules
  );

  const hasHigh = safetyOutput.violations.some((v) => v.severity === 'high');

  return {
    tool: 'inspect_content_safety',
    passed: safetyOutput.safe,
    score: safetyOutput.score,
    summary: safetyOutput.safe
      ? 'Konten aman dan memenuhi standar kepatuhan brand.'
      : 'Ditemukan potensi pelanggaran keamanan konten.',
    details: {
      provider: safetyOutput.provider,
      model: safetyOutput.model,
      reasoning: safetyOutput.reasoning,
    },
    violations: safetyOutput.violations,
  };
}

// ── Tool 3: Verify Brand Rules ──
export function toolVerifyBrandRules(
  transcript: string,
  campaignRules: string,
  brandName?: string
): ToolInspectionFinding {
  const violations: Violation[] = [];
  const text = transcript.toLowerCase();
  let score = 0.95;

  if (campaignRules && campaignRules.toLowerCase().includes('wajib mention') && brandName) {
    if (!text.includes(brandName.toLowerCase())) {
      violations.push({
        rule: 'missing_brand_mention',
        severity: 'medium',
        evidence: `Nama brand (${brandName}) tidak terdeteksi dalam ucapan transkrip audio.`,
      });
      score = 0.6;
    }
  }

  const passed = violations.length === 0;

  return {
    tool: 'verify_brand_rules',
    passed,
    score,
    summary: passed
      ? 'Klip mematuhi seluruh aturan khusus kampanye brand.'
      : 'Klip membutuhkan penyesuaian aturan kampanye.',
    details: { brandName, campaignRules },
    violations,
  };
}

// ── Main Orchestrator: Autonomous AI Auditor ──
export interface RunAiAuditorParams {
  video: VideoMetadataInput;
  campaign: CampaignRulesInput;
  transcript: string;
  llm: ILlmAdapter;
}

export async function runAiAuditor(params: RunAiAuditorParams): Promise<AiAuditorResult> {
  const { video, campaign, transcript, llm } = params;

  // Execute inspection tools
  const metadataFinding = toolInspectMetadata(video, campaign);
  const safetyFinding = await toolInspectContentSafety(video, transcript, campaign.rules, llm);
  const brandFinding = toolVerifyBrandRules(transcript, campaign.rules, campaign.brandName);

  const findings: ToolInspectionFinding[] = [metadataFinding, safetyFinding, brandFinding];

  // Aggregate all violations
  const allViolations: Violation[] = [
    ...metadataFinding.violations,
    ...safetyFinding.violations,
    ...brandFinding.violations,
  ];

  const hasHighViolation = allViolations.some((v) => v.severity === 'high');
  const hasMediumViolation = allViolations.some((v) => v.severity === 'medium');

  // Weighted score calculation:
  // - Safety: 50%
  // - Metadata: 30%
  // - Brand Alignment: 20%
  const overallScore = Number(
    (safetyFinding.score * 0.5 + metadataFinding.score * 0.3 + brandFinding.score * 0.2).toFixed(2)
  );

  let suggestedAction: 'APPROVE' | 'REJECT' | 'NEEDS_REVIEW' = 'APPROVE';
  let isApproved = true;

  if (hasHighViolation || overallScore < 0.6) {
    suggestedAction = 'REJECT';
    isApproved = false;
  } else if (hasMediumViolation || overallScore < 0.8) {
    suggestedAction = 'NEEDS_REVIEW';
    isApproved = false;
  }

  const match = video.description.match(VERIFICATION_CODE_REGEX);
  const codeFound = Boolean(match);
  const extractedCode = match ? `CS-${match[1]}-${match[2]}` : undefined;
  const campaignIdMatched = match ? parseInt(match[1], 10) === campaign.campaignId : false;

  const reasoning =
    allViolations.length === 0
      ? 'Audit AI menyimpulkan konten valid, orisinal, aman, dan siap diselesaikan untuk reward.'
      : allViolations.map((v) => `[${v.severity.toUpperCase()}] ${v.rule}: ${v.evidence}`).join(' | ');

  return {
    isApproved,
    overallScore,
    safetyScore: safetyFinding.score,
    metadataScore: metadataFinding.score,
    brandAlignmentScore: brandFinding.score,
    confidence: 0.95,
    suggestedAction,
    summary: isApproved
      ? 'Klip telah lulus audit AI secara otomatis dengan skor sempurna.'
      : `Audit AI menandai ${allViolations.length} catatan verifikasi.`,
    reasoning,
    violations: allViolations,
    findings,
    metadataSummary: {
      videoId: video.videoId,
      title: video.title,
      authorName: video.authorName,
      durationSec: video.durationSec,
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      codeFound,
      extractedCode,
      campaignIdMatched,
    },
    auditTimestamp: new Date().toISOString(),
    providerUsed: safetyFinding.details.provider || 'ai-engine',
  };
}
