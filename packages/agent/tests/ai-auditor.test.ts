import { describe, it, expect } from 'vitest';
import {
  toolInspectMetadata,
  toolInspectContentSafety,
  toolVerifyBrandRules,
  runAiAuditor,
  type VideoMetadataInput,
  type CampaignRulesInput,
} from '../src/adapters/ai-auditor.js';
import { MockLlmAdapter } from '../src/adapters/llm.js';

describe('Autonomous AI Auditor & Tool Inspection System', () => {
  const sampleCampaign: CampaignRulesInput = {
    campaignId: 42,
    title: 'Kampanye Edukasi AI Web3',
    rules: 'Wajib ramah keluarga, tanpa-kompetitor, wajib mention ClipStream',
    minViews: 500,
    brandName: 'ClipStream',
  };

  const validVideo: VideoMetadataInput = {
    videoId: 'dQw4w9WgXcQ',
    title: 'Tutorial AI Canggih 2026',
    description: 'Video edukasi ClipStream resmi. Kode verifikasi kepemilikan: CS-42-a1b2c3',
    durationSec: 45,
    views: 1200,
    likes: 80,
    comments: 15,
    authorName: 'TechCreator',
  };

  it('toolInspectMetadata passes on valid verification code and valid duration', () => {
    const finding = toolInspectMetadata(validVideo, sampleCampaign);
    expect(finding.passed).toBe(true);
    expect(finding.score).toBe(1.0);
    expect(finding.violations).toHaveLength(0);
    expect(finding.details.codeFound).toBe(true);
    expect(finding.details.campaignIdMatched).toBe(true);
  });

  it('toolInspectMetadata fails when campaign ID in description does not match target campaign', () => {
    const wrongCampaignVideo: VideoMetadataInput = {
      ...validVideo,
      description: 'Video review. CS-99-abcdef', // ID is 99, expected 42
    };

    const finding = toolInspectMetadata(wrongCampaignVideo, sampleCampaign);
    expect(finding.passed).toBe(false);
    expect(finding.score).toBeLessThanOrEqual(0.1);
    expect(finding.violations.some((v) => v.rule === 'invalid_campaign_code')).toBe(true);
  });

  it('toolInspectMetadata fails when verification code is completely absent', () => {
    const missingCodeVideo: VideoMetadataInput = {
      ...validVideo,
      description: 'Video tanpa kode verifikasi sama sekali.',
    };

    const finding = toolInspectMetadata(missingCodeVideo, sampleCampaign);
    expect(finding.passed).toBe(false);
    expect(finding.violations.some((v) => v.rule === 'missing_verification_code')).toBe(true);
  });

  it('toolInspectContentSafety integrates with LLM to detect violations', async () => {
    const llm = new MockLlmAdapter();
    const unsafeVideo: VideoMetadataInput = {
      ...validVideo,
      title: 'Klip Ujaran Kebencian',
      description: 'hina ras dan hina agama CS-42-123456',
    };

    const finding = await toolInspectContentSafety(
      unsafeVideo,
      'konten bermasalah',
      sampleCampaign.rules,
      llm
    );

    expect(finding.passed).toBe(false);
    expect(finding.score).toBeLessThan(0.5);
    expect(finding.violations.length).toBeGreaterThan(0);
  });

  it('toolVerifyBrandRules checks for mandatory brand mention when configured', () => {
    // Missing brand mention
    const finding1 = toolVerifyBrandRules(
      'Halo teman-teman selamat menonton video kita kali ini.',
      'wajib mention produk',
      'ClipStream'
    );
    expect(finding1.passed).toBe(false);
    expect(finding1.violations.some((v) => v.rule === 'missing_brand_mention')).toBe(true);

    // Has brand mention
    const finding2 = toolVerifyBrandRules(
      'Halo semua hari ini kita mencoba platform ClipStream AI yang sangat cepat.',
      'wajib mention produk',
      'ClipStream'
    );
    expect(finding2.passed).toBe(true);
    expect(finding2.violations).toHaveLength(0);
  });

  it('runAiAuditor produces comprehensive audit with APPROVE on clean submission', async () => {
    const llm = new MockLlmAdapter();
    const result = await runAiAuditor({
      video: validVideo,
      campaign: sampleCampaign,
      transcript: 'Halo semua, di video ini saya akan mengulas platform ClipStream AI terbaru yang memudahkan content creation.',
      llm,
    });

    expect(result.isApproved).toBe(true);
    expect(result.suggestedAction).toBe('APPROVE');
    expect(result.overallScore).toBeGreaterThanOrEqual(0.85);
    expect(result.violations).toHaveLength(0);
    expect(result.metadataSummary.codeFound).toBe(true);
    expect(result.metadataSummary.campaignIdMatched).toBe(true);
    expect(result.findings).toHaveLength(3);
  });

  it('runAiAuditor produces REJECT when critical metadata or high violation occurs', async () => {
    const llm = new MockLlmAdapter();
    const badVideo: VideoMetadataInput = {
      ...validVideo,
      description: 'Tidak ada kode verifikasi di sini.',
    };

    const result = await runAiAuditor({
      video: badVideo,
      campaign: sampleCampaign,
      transcript: 'Halo halo saja.',
      llm,
    });

    expect(result.isApproved).toBe(false);
    expect(result.suggestedAction).toBe('REJECT');
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
