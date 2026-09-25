import { randomUUID } from 'node:crypto';
import type { IDatabaseRepository } from '../db/repository.js';
import type { IChainService } from '../services/chain.service.js';
import { sseService } from '../services/sse.service.js';
import { runVerificationPipeline } from '@clipstream/agent';
import type {
  IYouTubeAdapter,
  IWhisperAdapter,
  IEmbeddingAdapter,
  ILlmAdapter,
} from '@clipstream/agent';
import {
  YouTubeAdapter,
  WhisperAdapter,
  MockYouTubeAdapter,
  MockWhisperAdapter,
  MockEmbeddingAdapter,
  MockLlmAdapter,
  createLlmAdapter,
  AgentSigner,
  chunkTranscript,
} from '@clipstream/agent';
import { OPBNB_TESTNET_CHAIN_ID } from '@clipstream/shared';

export interface VerifyClipWorkerDependencies {
  repo: IDatabaseRepository;
  chain: IChainService;
  youtube?: IYouTubeAdapter;
  whisper?: IWhisperAdapter;
  embedding?: IEmbeddingAdapter;
  llm?: ILlmAdapter;
  signer?: AgentSigner;
}

export class VerifyClipWorker {
  private repo: IDatabaseRepository;
  private chain: IChainService;
  private youtube: IYouTubeAdapter;
  private whisper: IWhisperAdapter;
  private embedding: IEmbeddingAdapter;
  private llm: ILlmAdapter;
  private signer: AgentSigner;

  constructor(deps: VerifyClipWorkerDependencies) {
    this.repo = deps.repo;
    this.chain = deps.chain;
    this.youtube =
      deps.youtube ||
      new YouTubeAdapter(process.env.YOUTUBE_API_KEY);
    this.whisper =
      deps.whisper ||
      (process.env.WHISPER_ENDPOINT_URL
        ? new WhisperAdapter(process.env.WHISPER_ENDPOINT_URL)
        : new MockWhisperAdapter());
    this.embedding = deps.embedding || new MockEmbeddingAdapter();
    this.llm = deps.llm || createLlmAdapter();

    const privateKey =
      (process.env.AGENT_PRIVATE_KEY as `0x${string}`) ||
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const verifyingContract =
      (process.env.CAMPAIGN_ESCROW_ADDRESS as `0x${string}`) ||
      '0x1234567890123456789012345678901234567890';
    const chainId = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : OPBNB_TESTNET_CHAIN_ID;

    this.signer =
      deps.signer ||
      new AgentSigner(privateKey, {
        chainId,
        verifyingContract,
      });
  }

  async processClip(clipId: string): Promise<void> {
    const clip = await this.repo.getClipById(clipId);
    if (!clip) return;

    const campaign = await this.repo.getCampaignById(clip.campaignId);
    if (!campaign) return;

    const sourceVideo = await this.repo.getSourceVideoById(campaign.sourceVideoId);
    if (!sourceVideo) return;

    const clipper = await this.repo.getUserById(clip.clipperId);
    const clipperAddress =
      (clipper?.walletAddress as `0x${string}`) ||
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    // 1. Create verification run
    const traceId = randomUUID();
    const run = await this.repo.createVerificationRun(clipId, traceId);

    // 2. Fetch source chunks or synthesize default chunks
    let dbChunks = await this.repo.getSourceChunks(sourceVideo.id);
    if (dbChunks.length === 0) {
      const defaultText =
        sourceVideo.transcript ||
        'Halo semua, episode podcast bincang teknologi mendiskusikan Web3 dan ekosistem AI agent secara komprehensif.';
      const segments = [
        { start: 0, end: 30, text: defaultText.slice(0, 60) },
        { start: 30, end: 60, text: defaultText.slice(60) || defaultText },
      ];
      const rawChunks = chunkTranscript(segments, 15, 5);
      const embeddings = await this.embedding.embedBatch(rawChunks.map((c) => c.text));

      dbChunks = await this.repo.insertSourceChunks(
        rawChunks.map((c, i) => ({
          sourceVideoId: sourceVideo.id,
          chunkIndex: i,
          startSec: c.startSec,
          endSec: c.endSec,
          chunkText: c.text,
          embedding: embeddings[i],
        }))
      );
    }

    const sourceChunks = dbChunks.map((c) => ({
      chunkIndex: c.chunkIndex,
      startSec: c.startSec,
      endSec: c.endSec,
      text: c.chunkText,
      embedding: c.embedding || [],
    }));

    const nextNonce = await this.repo.getNextNonce();
    const approvalRate = await this.chain.getClipperApprovalRate(clipperAddress);

    // Initial SSE broadcast
    sseService.broadcast(clipId, {
      type: 'stage_start',
      stage: 'ownership',
      label: 'Memeriksa kepemilikan video…',
      at: new Date().toISOString(),
    });

    const startTime = Date.now();

    // 3. Run Pipeline
    const outcome = await runVerificationPipeline(
      {
        clipUrl: clip.url,
        campaign: {
          id: campaign.id,
          onchainId: campaign.onchainId ?? 1n,
          brandId: campaign.brandId,
          sourceVideoId: campaign.sourceVideoId,
          title: campaign.title,
          rules: campaign.rules,
          cpmRate: campaign.cpmRate,
          totalBudget: campaign.totalBudget,
          maxPayoutPerClip: campaign.maxPayoutPerClip,
          minViews: campaign.minViews,
          deadline: campaign.deadline,
          sourceHash: campaign.sourceHash,
          rulesHash: campaign.rulesHash,
          tokenAddress: campaign.tokenAddress as `0x${string}`,
          createdAt: campaign.createdAt,
        },
        sourceVideo: {
          id: sourceVideo.id,
          platform: 'youtube',
          videoId: sourceVideo.videoId,
          videoIdHash: sourceVideo.videoIdHash,
          title: sourceVideo.title,
          durationSec: sourceVideo.durationSec,
          transcript: sourceVideo.transcript || '',
          transcriptHash:
            sourceVideo.transcriptHash ||
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        clip: {
          id: clip.id,
          onchainId: clip.onchainId ?? 1n,
          campaignId: clip.campaignId,
          clipperId: clip.clipperId,
          clipperAddress,
          videoId: clip.videoId,
          videoIdHash: clip.videoIdHash,
          platform: 'youtube',
          paidViews: clip.paidViews,
          releasedAmount: clip.releasedAmount,
          holdbackAmount: clip.holdbackAmount,
          status: 'ACTIVE',
        },
        sourceChunks: dbChunks.map((c) => ({
          idx: c.chunkIndex,
          startSec: c.startSec,
          endSec: c.endSec,
          text: c.chunkText,
          embedding: c.embedding || [],
        })),
        nextNonce,
        clipperApprovalRate: approvalRate,
      },
      {
        youtube: this.youtube,
        whisper: this.whisper,
        embedding: this.embedding,
        llm: this.llm,
        signer: this.signer,
      }
    );

    // 4. Record stage results and stream SSE
    let order = 1;
    for (const [stageName, stageRes] of outcome.results.entries()) {
      await this.repo.insertStageResult({
        runId: run.id,
        stage: stageName,
        stageOrder: order++,
        status: stageRes.status,
        score: stageRes.score ?? null,
        data: (stageRes.data as Record<string, unknown>) || {},
        reason: stageRes.reason || null,
        durationMs: stageRes.durationMs,
        modelVersion: null,
      });

      sseService.broadcast(clipId, {
        type: 'stage_complete',
        stage: stageName,
        status: stageRes.status,
        score: stageRes.score ?? null,
        label:
          stageRes.status === 'PASS'
            ? `${stageName} lolos`
            : `${stageName}: ${stageRes.reason || 'Selesai'}`,
        reason: stageRes.reason || null,
        at: new Date().toISOString(),
      });
    }

    const durationMs = Date.now() - startTime;
    await this.repo.completeVerificationRun(run.id, outcome.status, durationMs);

    // 5. Handle Outcome
    if (outcome.status === 'SETTLED') {
      const { attestation, signature, evidenceBundle } = outcome.settle;

      // Calculate payout amounts matching CampaignEscrow.sol onchain logic
      const newViews = BigInt(Math.max(0, attestation.verifiedViews - clip.paidViews));
      const grossPayout = (newViews * campaign.cpmRate) / 1000n;
      const currentTotal = clip.releasedAmount + clip.holdbackAmount;
      const cappedPayout =
        currentTotal + grossPayout > campaign.maxPayoutPerClip
          ? (campaign.maxPayoutPerClip > currentTotal
              ? campaign.maxPayoutPerClip - currentTotal
              : 0n)
          : grossPayout;

      // Edge case: If clip has already hit maximum allowed payout ceiling
      if (cappedPayout === 0n) {
        await this.repo.updateClip(clipId, {
          status: 'ACTIVE',
          rejectionReason: 'Batas maksimum payout per klip tercapai.',
          nextCheckAt: null,
        });

        sseService.broadcast(clipId, {
          type: 'done',
          finalStatus: 'ACTIVE',
          at: new Date().toISOString(),
        });
        return;
      }

      // Onchain release
      const txResult = await this.chain.releaseMilestone(attestation, signature);

      // Platform & Protocol Fee (5.00% take-rate to sustain AI verification infra and treasury)
      const platformFeeBps = 500n;
      const platformFeeAmount = (cappedPayout * platformFeeBps) / 10000n;
      const netPayout = cappedPayout > platformFeeAmount ? cappedPayout - platformFeeAmount : cappedPayout;

      const holdbackBps =
        attestation.anomalyBps <= 4500
          ? 3000n
          : attestation.anomalyBps <= 7500
          ? 5000n
          : 10000n;
      const holdbackAmount = (netPayout * holdbackBps) / 10000n;
      const immediateAmount = netPayout - holdbackAmount;

      const dbAtt = await this.repo.createAttestation({
        clipId,
        runId: run.id,
        nonce: attestation.nonce,
        verifiedViews: attestation.verifiedViews,
        sourceMatchBps: attestation.sourceMatchBps,
        safetyBps: attestation.safetyBps,
        anomalyBps: attestation.anomalyBps,
        evidenceHash: attestation.evidenceHash,
        ipfsCid: null,
        expiry: new Date(Number(attestation.expiry) * 1000),
        signature,
        signerAddress: this.signer.address,
        txHash: txResult.txHash,
        txStatus: 'CONFIRMED',
        gasUsed: txResult.gasUsed,
        blockNumber: txResult.blockNumber,
        releasedAmount: immediateAmount,
        holdbackAmount: holdbackAmount,
        confirmedAt: new Date(),
      });

      await this.repo.createEvidenceBundle({
        attestationId: dbAtt.id,
        payload: {
          ...evidenceBundle,
          financials: {
            grossPayout: cappedPayout.toString(),
            platformFeeAmount: platformFeeAmount.toString(),
            platformFeeBps: Number(platformFeeBps),
            netPayout: netPayout.toString(),
            immediateAmount: immediateAmount.toString(),
            holdbackAmount: holdbackAmount.toString(),
          },
        },
        payloadHash: attestation.evidenceHash,
        ipfsCid: null,
        ipfsStatus: 'PENDING',
      });

      const holdbackUnlockAt = new Date(Date.now() + 72 * 3600_000);

      await this.repo.updateClip(clipId, {
        status: 'ACTIVE',
        paidViews: attestation.verifiedViews,
        releasedAmount: clip.releasedAmount + immediateAmount,
        holdbackAmount: clip.holdbackAmount + holdbackAmount,
        holdbackUnlockAt,
        lastVerifiedAt: new Date(),
        nextCheckAt: new Date(Date.now() + 1800_000),
      });

      sseService.broadcast(clipId, {
        type: 'payout',
        grossPayout: cappedPayout.toString(),
        platformFee: platformFeeAmount.toString(),
        platformFeeBps: Number(platformFeeBps),
        releasedAmount: immediateAmount.toString(),
        holdbackAmount: holdbackAmount.toString(),
        holdbackUnlockAt: holdbackUnlockAt.toISOString(),
        txHash: txResult.txHash,
        explorerUrl: `https://testnet.opbnbscan.com/tx/${txResult.txHash}`,
        at: new Date().toISOString(),
      });

      sseService.broadcast(clipId, {
        type: 'done',
        finalStatus: 'ACTIVE',
        at: new Date().toISOString(),
      });
    } else if (outcome.status === 'DEFERRED') {
      const nextCheckAt = new Date(Date.now() + 1800_000);
      await this.repo.updateClip(clipId, {
        status: 'PENDING_VIEWS',
        nextCheckAt,
        rejectionReason: outcome.reason,
      });

      sseService.broadcast(clipId, {
        type: 'deferred',
        nextCheckAt: nextCheckAt.toISOString(),
        reason: outcome.reason,
        at: new Date().toISOString(),
      });
    } else if (outcome.status === 'REJECTED') {
      await this.repo.updateClip(clipId, {
        status: 'REJECTED',
        rejectionCode: outcome.failedStage.toUpperCase(),
        rejectionReason: outcome.reason,
      });

      sseService.broadcast(clipId, {
        type: 'rejected',
        code: outcome.failedStage.toUpperCase(),
        reason: outcome.reason,
        suggestion: outcome.reason,
        at: new Date().toISOString(),
      });
    } else if (outcome.status === 'NEEDS_REVIEW') {
      await this.repo.updateClip(clipId, {
        status: 'NEEDS_REVIEW',
        rejectionReason: outcome.reason,
      });

      sseService.broadcast(clipId, {
        type: 'error',
        message: outcome.reason,
        at: new Date().toISOString(),
      });
    }
  }
}
