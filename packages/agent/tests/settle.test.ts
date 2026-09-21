import { describe, it, expect } from 'vitest';
import { keccak256, toHex, recoverTypedDataAddress } from 'viem';
import {
  type CampaignRecord,
  type ClipRecord,
  ATTESTATION_EIP712_TYPES,
  OPBNB_TESTNET_CHAIN_ID,
  EvidenceBundleSchema,
} from '@clipstream/shared';
import { AgentSigner } from '../src/signer.js';
import { canonicalStringify, executeSettleStage } from '../src/stages/07-settle.js';

describe('Stage 7 — Settle & EIP-712 Signing', () => {
  // Test private key (Hardhat/Anvil account 0)
  const agentPrivateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const escrowContract = '0x1234567890123456789012345678901234567890';

  const signer = new AgentSigner(agentPrivateKey, {
    chainId: OPBNB_TESTNET_CHAIN_ID,
    verifyingContract: escrowContract,
  });

  const mockCampaign: CampaignRecord = {
    id: 'campaign-123',
    onchainId: 1n,
    brandId: 'brand-1',
    sourceVideoId: 'src-1',
    title: 'Podcast Bincang Web3',
    rules: 'tanpa sara',
    cpmRate: 300000n,
    totalBudget: 50000000n,
    maxPayoutPerClip: 15000000n,
    minViews: 1000,
    deadline: new Date('2026-10-01T00:00:00Z'),
    sourceHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
    rulesHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    createdAt: new Date('2026-09-01T00:00:00Z'),
  };

  const mockClip: ClipRecord = {
    id: 'a0000000-0000-0000-0000-000000000001',
    onchainId: 1n,
    campaignId: 'campaign-123',
    clipperId: 'clipper-1',
    clipperAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    videoId: 'dQw4w9WgXcQ',
    videoIdHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    platform: 'youtube',
    paidViews: 0,
    releasedAmount: 0n,
    holdbackAmount: 0n,
    status: 'ACTIVE',
  };

  it('produces identical canonical JSON string regardless of key insertion order', () => {
    const objA = { z: 1, a: 2, m: { y: 'test', x: 10 } };
    const objB = { a: 2, m: { x: 10, y: 'test' }, z: 1 };

    const canonicalA = canonicalStringify(objA);
    const canonicalB = canonicalStringify(objB);

    expect(canonicalA).toBe(canonicalB);
    expect(canonicalA).toBe('{"a":2,"m":{"x":10,"y":"test"},"z":1}');
  });

  it('assembles a valid evidence bundle and signs EIP-712 attestation', async () => {
    const settleOutput = await executeSettleStage({
      campaign: mockCampaign,
      clip: mockClip,
      ownership: {
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        videoIdHash: mockClip.videoIdHash,
        codeFound: 'CS-1-a1b2c3',
        publishedAt: '2026-09-10T12:00:00.000Z',
        channelId: 'UC123',
      },
      metrics: {
        views: 8500,
        likes: 450,
        comments: 30,
        durationSec: 55,
        fetchedAt: '2026-09-11T12:00:00.000Z',
      },
      transcriptHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      sourceMatch: {
        score: 0.88,
        coverage: 0.9,
        contiguity: 1.0,
        matchedChunks: [],
        clipChunkCount: 3,
        matchedChunkCount: 3,
        sourceSpan: { startSec: 10, endSec: 70 },
      },
      brandSafety: {
        safe: true,
        score: 0.95,
        violations: [],
        reasoning: 'Clean content',
      },
      anomaly: {
        score: 0.15,
        signals: {
          engagementRatio: { raw: 0.056, normalized: 0 },
          velocityZScore: { raw: 100, normalized: 0 },
          likeCommentRatio: { raw: 15, normalized: 0 },
          accountHistory: { raw: 0.9, normalized: 0.1 },
        },
        note: 'Normal',
      },
      nonce: 42n,
      agentSigner: signer,
    });

    // 1. Validate Evidence Bundle matches Zod schema
    const parseResult = EvidenceBundleSchema.safeParse(settleOutput.evidenceBundle);
    expect(parseResult.success).toBe(true);

    // 2. Verify evidenceHash equals keccak256 of canonical JSON
    const expectedHash = keccak256(toHex(settleOutput.canonicalJson));
    expect(settleOutput.evidenceHash).toBe(expectedHash);

    // 3. Verify attestation parameters
    expect(settleOutput.attestation.clipId).toBe(1n);
    expect(settleOutput.attestation.campaignId).toBe(1n);
    expect(settleOutput.attestation.verifiedViews).toBe(8500);
    expect(settleOutput.attestation.sourceMatchBps).toBe(8800);
    expect(settleOutput.attestation.safetyBps).toBe(9500);
    expect(settleOutput.attestation.anomalyBps).toBe(1500);
    expect(settleOutput.attestation.nonce).toBe(42n);

    // 4. Verify signature recovery using viem recoverTypedDataAddress
    const recoveredAddress = await recoverTypedDataAddress({
      domain: {
        name: 'ClipStream',
        version: '1',
        chainId: OPBNB_TESTNET_CHAIN_ID,
        verifyingContract: escrowContract,
      },
      types: ATTESTATION_EIP712_TYPES,
      primaryType: 'Attestation',
      message: settleOutput.attestation,
      signature: settleOutput.signature,
    });

    expect(recoveredAddress.toLowerCase()).toBe(signer.address.toLowerCase());
  });
});
