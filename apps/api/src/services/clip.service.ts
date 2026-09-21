import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import { keccak256, encodePacked } from 'viem';
import type { IDatabaseRepository, ClipEntity } from '../db/repository.js';
import type { IChainService } from './chain.service.js';

const ALLOWED_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];

export function assertSafeUrl(rawUrl: string): void {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      throw new Error('URL_UNRECOGNIZED');
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname.toLowerCase())) {
      throw new Error('URL_UNRECOGNIZED');
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
      throw new Error('URL_UNRECOGNIZED');
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'URL_UNRECOGNIZED') {
      throw err;
    }
    throw new Error('URL_UNRECOGNIZED');
  }
}

export function parseYouTubeVideoId(rawUrl: string): string {
  const match = rawUrl
    .trim()
    .match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) {
    throw new Error('URL_UNRECOGNIZED');
  }
  return match[1];
}

export interface SubmitClipResult {
  clipId: string;
  status: 'SUBMITTED';
  eventsUrl: string;
  estimatedDurationSec: number;
}

export interface ClipDetailResponse {
  id: string;
  onchainId: string | null;
  status: ClipEntity['status'];
  url: string;
  platform: string;
  submittedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    lastCheckedAt: string;
  } | null;
  verification: {
    stages: Array<{
      stage: string;
      status: 'PASS' | 'FAIL' | 'REVIEW' | 'DEFER' | 'ERROR';
      score: number | null;
      label: string;
      reason: string | null;
      durationMs: number;
    }>;
    completedAt: string | null;
  };
  payouts: Array<{
    attestationId: string;
    verifiedViews: number;
    releasedAmount: string;
    holdbackAmount: string;
    holdbackUnlockAt: string | null;
    txHash: string | null;
    createdAt: string;
  }>;
  totals: {
    releasedAmount: string;
    holdbackAmount: string;
    claimableNow: string;
  };
  evidence: {
    ipfsCid: string | null;
    evidenceHash: string;
  } | null;
  rejection: {
    code: string;
    reason: string;
    suggestion: string;
  } | null;
}

const STAGE_LABELS: Record<string, { inProgress: string; pass: string }> = {
  ownership: {
    inProgress: 'Memeriksa kepemilikan video…',
    pass: 'Kepemilikan terverifikasi',
  },
  metrics: {
    inProgress: 'Membaca jumlah views…',
    pass: 'Views terbaca',
  },
  transcript: {
    inProgress: 'Menganalisis audio klip…',
    pass: 'Transkrip siap',
  },
  source_match: {
    inProgress: 'Mencocokkan dengan video sumber…',
    pass: 'Kecocokan dengan sumber sesuai',
  },
  brand_safety: {
    inProgress: 'Memeriksa pedoman brand…',
    pass: 'Brand safety lolos',
  },
  anomaly: {
    inProgress: 'Memeriksa pola views…',
    pass: 'Pola views normal',
  },
  settle: {
    inProgress: 'Mengirim pembayaran onchain…',
    pass: 'Pembayaran terkirim',
  },
};

export class ClipService {
  constructor(
    private readonly repo: IDatabaseRepository,
    private readonly chain: IChainService
  ) {}

  async submitClip(
    campaignId: string,
    clipperId: string,
    url: string
  ): Promise<SubmitClipResult> {
    assertSafeUrl(url);

    const campaign = await this.repo.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('NOT_FOUND');
    }

    if (campaign.status !== 'ACTIVE') {
      const err = new Error('CAMPAIGN_INACTIVE');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    if (campaign.deadline.getTime() <= Date.now()) {
      const err = new Error('CAMPAIGN_EXPIRED');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const videoId = parseYouTubeVideoId(url);
    const videoIdHash = keccak256(encodePacked(['string', 'string'], ['youtube', videoId]));

    // Global unique video registration check (mitigation T3)
    const existingClip = await this.repo.getClipByVideoHash(videoIdHash);
    if (existingClip) {
      const err = new Error('DUPLICATE_VIDEO');
      (err as unknown as { statusCode: number }).statusCode = 409;
      throw err;
    }

    let participant = await this.repo.getParticipant(campaignId, clipperId);
    if (!participant) {
      const onchainIdNum = campaign.onchainId ? campaign.onchainId.toString() : '1';
      const codeHash = createHash('sha256')
        .update(`${campaignId}:${clipperId}:clipstream-salt`)
        .digest('hex')
        .slice(0, 6)
        .toLowerCase();
      const generatedCode = `CS-${onchainIdNum}-${codeHash}`;
      participant = await this.repo.joinCampaign(campaignId, clipperId, generatedCode);
    }
    const verificationCode = participant.verificationCode;

    const clip = await this.repo.createClip({
      onchainId: null,
      campaignId,
      clipperId,
      platform: 'youtube',
      videoId,
      videoIdHash,
      url,
      verificationCode,
      publishedAt: null,
      durationSec: null,
      transcript: null,
      transcriptHash: null,
      paidViews: 0,
      releasedAmount: 0n,
      holdbackAmount: 0n,
      holdbackUnlockAt: null,
      status: 'SUBMITTED',
      rejectionCode: null,
      rejectionReason: null,
      registerTxHash: null,
      lastVerifiedAt: null,
      nextCheckAt: new Date(Date.now() + 1800_000),
    });

    return {
      clipId: clip.id,
      status: 'SUBMITTED',
      eventsUrl: `/api/clips/${clip.id}/events`,
      estimatedDurationSec: 15,
    };
  }

  async getClipDetail(clipId: string): Promise<ClipDetailResponse> {
    const clip = await this.repo.getClipById(clipId);
    if (!clip) {
      throw new Error('NOT_FOUND');
    }

    const runs = await this.repo.listRunsByClipId(clipId);
    const latestRun = runs[0] || null;

    let stages: ClipDetailResponse['verification']['stages'] = [];
    if (latestRun) {
      const dbStages = await this.repo.listStageResultsByRun(latestRun.id);
      stages = dbStages.map((s) => ({
        stage: s.stage,
        status: s.status,
        score: s.score,
        label:
          s.status === 'PASS'
            ? STAGE_LABELS[s.stage]?.pass || s.stage
            : STAGE_LABELS[s.stage]?.inProgress || s.stage,
        reason: s.reason,
        durationMs: s.durationMs,
      }));
    }

    const attestations = await this.repo.listAttestationsByClip(clipId);
    const payouts = attestations.map((a) => ({
      attestationId: a.id,
      verifiedViews: a.verifiedViews,
      releasedAmount: a.releasedAmount?.toString() || '0',
      holdbackAmount: a.holdbackAmount?.toString() || '0',
      holdbackUnlockAt: clip.holdbackUnlockAt?.toISOString() || null,
      txHash: a.txHash,
      createdAt: a.createdAt.toISOString(),
    }));

    const snapshots = await this.repo.getMetricSnapshots(clipId);
    const latestSnapshot = snapshots[0] || null;

    const latestAtt = attestations[0] || null;
    let evidence: ClipDetailResponse['evidence'] = null;
    if (latestAtt) {
      const bundle = await this.repo.getEvidenceBundleByAttestation(latestAtt.id);
      evidence = {
        ipfsCid: bundle?.ipfsCid || null,
        evidenceHash: latestAtt.evidenceHash,
      };
    }

    const now = Date.now();
    const canClaimHoldback =
      clip.holdbackUnlockAt &&
      clip.holdbackUnlockAt.getTime() <= now &&
      clip.status === 'ACTIVE' &&
      clip.holdbackAmount > 0n;

    return {
      id: clip.id,
      onchainId: clip.onchainId ? clip.onchainId.toString() : null,
      status: clip.status,
      url: clip.url,
      platform: clip.platform,
      submittedAt: clip.submittedAt.toISOString(),
      metrics: latestSnapshot
        ? {
            views: latestSnapshot.views,
            likes: latestSnapshot.likes,
            comments: latestSnapshot.comments,
            lastCheckedAt: latestSnapshot.capturedAt.toISOString(),
          }
        : null,
      verification: {
        stages,
        completedAt: latestRun?.finishedAt?.toISOString() || null,
      },
      payouts,
      totals: {
        releasedAmount: clip.releasedAmount.toString(),
        holdbackAmount: clip.holdbackAmount.toString(),
        claimableNow: canClaimHoldback ? clip.holdbackAmount.toString() : '0',
      },
      evidence,
      rejection:
        clip.status === 'REJECTED' && clip.rejectionCode && clip.rejectionReason
          ? {
              code: clip.rejectionCode,
              reason: clip.rejectionReason,
              suggestion: getRejectionSuggestion(clip.rejectionCode),
            }
          : null,
    };
  }

  async flagClip(clipId: string, brandId: string, reason: string): Promise<ClipEntity> {
    const clip = await this.repo.getClipById(clipId);
    if (!clip) throw new Error('NOT_FOUND');

    const campaign = await this.repo.getCampaignById(clip.campaignId);
    if (!campaign || campaign.brandId !== brandId) {
      const err = new Error('FORBIDDEN');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    return this.repo.updateClip(clipId, {
      status: 'FLAGGED',
      rejectionReason: `Ditandai oleh brand: ${reason}`,
    });
  }

  async appealClip(clipId: string, clipperId: string, reason: string): Promise<void> {
    const clip = await this.repo.getClipById(clipId);
    if (!clip) throw new Error('NOT_FOUND');

    if (clip.clipperId !== clipperId) {
      const err = new Error('FORBIDDEN');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    await this.repo.createAppeal({
      clipId,
      clipperId,
      reason,
      status: 'PENDING',
      reviewNotes: null,
    });
  }
}

function getRejectionSuggestion(code: string): string {
  switch (code) {
    case 'CODE_MISSING':
      return 'Tambahkan kode verifikasi kampanye ke dalam deskripsi video YouTube Shorts Anda, lalu submit ulang.';
    case 'CHANNEL_MISMATCH':
      return 'Pastikan video diunggah dari akun YouTube yang terhubung dengan profil Anda.';
    case 'SOURCE_MISMATCH':
      return 'Pastikan klip memotong materi langsung dari video sumber kampanye yang ditentukan.';
    case 'SAFETY_VIOLATION':
      return 'Periksa kembali rubrik brand safety pada kampanye dan hindari klaim yang tidak diizinkan.';
    case 'ANOMALY_HIGH':
      return 'Pola interaksi tidak wajar terdeteksi. Hubungi tim support jika Anda merasa ini keliru.';
    default:
      return 'Periksa pedoman kampanye dan pastikan video memenuhi seluruh persyaratan.';
  }
}
