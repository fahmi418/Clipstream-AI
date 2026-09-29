import { createHash } from 'node:crypto';
import { keccak256, toHex, stringToBytes } from 'viem';
import type { IDatabaseRepository, CampaignEntity } from '../db/repository.js';
import type { IChainService } from './chain.service.js';

export interface CreateCampaignInput {
  brandId: string;
  sourceUrl: string;
  title: string;
  description?: string;
  rules: string;
  tokenAddress?: string;
  cpmRate: string;
  totalBudget: string;
  maxPayoutPerClip: string;
  minViews: number;
  deadline: string;
}

export interface CreateCampaignResult {
  campaignId: string;
  status: 'PREPROCESSING' | 'READY';
  sourceHash: `0x${string}`;
  rulesHash: `0x${string}`;
  estimatedReadyInSec: number;
  onchainArgs: {
    token: string;
    totalBudget: string;
    cpmRate: string;
    maxPayoutPerClip: string;
    minViews: number;
    deadline: number;
    sourceHash: `0x${string}`;
    rulesHash: `0x${string}`;
  };
}

export interface JoinCampaignResult {
  verificationCode: string;
  instructions: {
    id: string;
    en: string;
  };
  sourceVideoUrl: string;
  rules: string;
}

export interface CampaignListItem {
  id: string;
  onchainId: string;
  title: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  brand: { address: string; displayName: string | null };
  sourceVideo: { title: string; thumbnailUrl: string; durationSec: number; videoId?: string };
  cpmRate: string;
  cpmRateDisplay: string;
  totalBudget: string;
  remainingBudget: string;
  maxPayoutPerClip: string;
  minViews: number;
  deadline: string;
  clipperCount: number;
  clipCount: number;
  status: CampaignEntity['status'];
}

export class CampaignService {
  constructor(
    private readonly repo: IDatabaseRepository,
    private readonly chain: IChainService
  ) {}

  async createCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult> {
    const cpmRateBig = BigInt(input.cpmRate);
    const totalBudgetBig = BigInt(input.totalBudget);
    const maxPayoutBig = BigInt(input.maxPayoutPerClip);

    if (maxPayoutBig > totalBudgetBig) {
      throw new Error('Cap per klip tidak boleh melebihi total budget');
    }

    const deadlineDate = new Date(input.deadline);
    if (deadlineDate.getTime() <= Date.now() + 3600_000) {
      throw new Error('Deadline minimal 1 jam dari sekarang');
    }

    // 1. Create or retrieve source video record
    const videoIdMatch = input.sourceUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([A-Za-z0-9_-]{11})/
    );
    const rawVideoId = videoIdMatch ? videoIdMatch[1] : 'source000000';
    const videoIdHash = keccak256(stringToBytes(`youtube:${rawVideoId}`));

    let sourceVideo = await this.repo.getSourceVideoByHash(videoIdHash);
    if (!sourceVideo) {
      sourceVideo = await this.repo.createSourceVideo({
        platform: 'youtube',
        videoId: rawVideoId,
        videoIdHash,
        title: input.title,
        durationSec: 1800,
        transcript: null,
        transcriptHash: null,
        transcriptStatus: 'READY',
      });
    }

    // 2. Compute hashes
    const sourceHash = keccak256(stringToBytes(`source:${input.sourceUrl}`));
    const rulesHash = keccak256(stringToBytes(input.rules));

    const token = input.tokenAddress || '0x0000000000000000000000000000000000000000';

    // 3. Save campaign record
    const campaign = await this.repo.createCampaign({
      onchainId: null,
      brandId: input.brandId,
      sourceVideoId: sourceVideo.id,
      title: input.title,
      rules: input.rules,
      tokenAddress: token,
      cpmRate: cpmRateBig,
      totalBudget: totalBudgetBig,
      maxPayoutPerClip: maxPayoutBig,
      minViews: input.minViews,
      deadline: deadlineDate,
      sourceHash,
      rulesHash,
      status: 'PREPROCESSING',
      createTxHash: null,
      activatedAt: null,
    });

    const deadlineUnix = Math.floor(deadlineDate.getTime() / 1000);

    return {
      campaignId: campaign.id,
      status: 'PREPROCESSING',
      sourceHash,
      rulesHash,
      estimatedReadyInSec: 30,
      onchainArgs: {
        token,
        totalBudget: input.totalBudget,
        cpmRate: input.cpmRate,
        maxPayoutPerClip: input.maxPayoutPerClip,
        minViews: input.minViews,
        deadline: deadlineUnix,
        sourceHash,
        rulesHash,
      },
    };
  }

  async joinCampaign(campaignId: string, userId: string): Promise<JoinCampaignResult> {
    const campaign = await this.repo.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign tidak ditemukan');
    }

    const onchainIdNum = campaign.onchainId ? campaign.onchainId.toString() : '1';

    // Deterministic verification code generation:
    // CS-{onchainId}-{sha256(campaignId + userId + salt).slice(0, 6)}
    const hash = createHash('sha256')
      .update(`${campaignId}:${userId}:clipstream-salt`)
      .digest('hex')
      .slice(0, 6)
      .toLowerCase();

    const verificationCode = `CS-${onchainIdNum}-${hash}`;

    await this.repo.joinCampaign(campaignId, userId, verificationCode);

    const sourceVideo = await this.repo.getSourceVideoById(campaign.sourceVideoId);
    const sourceVideoUrl = sourceVideo
      ? `https://youtube.com/watch?v=${sourceVideo.videoId}`
      : 'https://youtube.com';

    return {
      verificationCode,
      instructions: {
        id: `Tempelkan kode ${verificationCode} di deskripsi YouTube Shorts Anda sebelum mengirimkan link.`,
        en: `Paste verification code ${verificationCode} into your YouTube Shorts description before submitting.`,
      },
      sourceVideoUrl,
      rules: campaign.rules,
    };
  }

  async listCampaigns(query?: {
    status?: string;
    sort?: string;
    limit?: number;
  }): Promise<{ items: CampaignListItem[]; nextCursor: string | null }> {
    const records = await this.repo.listCampaigns({
      status: query?.status || 'ACTIVE',
      limit: query?.limit || 20,
    });

    const items: CampaignListItem[] = [];

    for (const c of records) {
      const brand = await this.repo.getUserById(c.brandId);
      const sourceVideo = await this.repo.getSourceVideoById(c.sourceVideoId);
      const clipperCount = await this.repo.countParticipants(c.id);
      const clipCount = await this.repo.countClipsByCampaign(c.id);

      const remainingBudget = c.onchainId
        ? (await this.chain.getCampaignBudget(c.onchainId)).remaining.toString()
        : c.totalBudget.toString();

      const videoId = sourceVideo?.videoId || '';
      const sourceUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

      items.push({
        id: c.id,
        onchainId: c.onchainId ? c.onchainId.toString() : '0',
        title: c.title,
        sourceUrl,
        thumbnailUrl,
        brand: {
          address: brand?.walletAddress || '0x0000000000000000000000000000000000000000',
          displayName: brand?.displayName || null,
        },
        sourceVideo: {
          title: sourceVideo?.title || 'Video Sumber',
          thumbnailUrl,
          durationSec: sourceVideo?.durationSec || 0,
          videoId,
        },
        cpmRate: c.cpmRate.toString(),
        cpmRateDisplay: `${c.cpmRate.toString()} (${c.tokenAddress === '0x0000000000000000000000000000000000000000' ? 'BNB' : 'BEP-20'}) / 1.000 views`,
        totalBudget: c.totalBudget.toString(),
        remainingBudget,
        maxPayoutPerClip: c.maxPayoutPerClip.toString(),
        minViews: c.minViews,
        deadline: c.deadline.toISOString(),
        clipperCount,
        clipCount,
        status: c.status,
      });
    }

    return {
      items,
      nextCursor: null,
    };
  }

  async getCampaign(id: string): Promise<any> {
    const c = await this.repo.getCampaignById(id);
    if (!c) return null;

    const brand = await this.repo.getUserById(c.brandId);
    const sourceVideo = await this.repo.getSourceVideoById(c.sourceVideoId);
    const clipperCount = await this.repo.countParticipants(c.id);
    const clipCount = await this.repo.countClipsByCampaign(c.id);

    const remainingBudget = c.onchainId
      ? (await this.chain.getCampaignBudget(c.onchainId)).remaining.toString()
      : c.totalBudget.toString();

    return {
      id: c.id,
      onchainId: c.onchainId ? c.onchainId.toString() : '0',
      title: c.title,
      description: null,
      brandId: c.brandId,
      sourceUrl: sourceVideo ? `https://www.youtube.com/watch?v=${sourceVideo.videoId}` : '',
      rules: c.rules,
      tokenAddress: c.tokenAddress,
      cpmRate: c.cpmRate.toString(),
      cpmRateDisplay: `${c.cpmRate.toString()} (${c.tokenAddress === '0x0000000000000000000000000000000000000000' ? 'BNB' : 'BEP-20'}) / 1.000 views`,
      totalBudget: c.totalBudget.toString(),
      remainingBudget,
      maxPayoutPerClip: c.maxPayoutPerClip.toString(),
      minViews: c.minViews,
      deadline: c.deadline.toISOString(),
      clipperCount,
      clipCount,
      status: c.status,
      brand: {
        address: brand?.walletAddress || '0x0000000000000000000000000000000000000000',
        displayName: brand?.displayName || null,
      },
      sourceVideo: {
        title: sourceVideo?.title || 'Video Sumber',
        thumbnailUrl: sourceVideo
          ? `https://img.youtube.com/vi/${sourceVideo.videoId}/hqdefault.jpg`
          : '',
        durationSec: sourceVideo?.durationSec || 0,
        videoId: sourceVideo?.videoId || '',
      },
      txHash: c.createTxHash || null,
      createdAt: c.createdAt.toISOString(),
    };
  }
}
