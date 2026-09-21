import { describe, it, expect } from 'vitest';
import { encodeFunctionData } from 'viem';
import { campaignEscrowAbi } from '../src/abis/CampaignEscrow.js';
import type { Attestation } from '@clipstream/shared';

describe('Contracts SDK — Integration & Calldata Encoding', () => {
  it('encodes releaseMilestone calldata matching Solidity parameter types exactly', () => {
    const mockAttestation: Attestation = {
      clipId: 42n,
      campaignId: 1n,
      clipper: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      videoIdHash:
        '0x1234567890123456789012345678901234567890123456789012345678901234',
      verifiedViews: 12000,
      sourceMatchBps: 8712,
      safetyBps: 9400,
      anomalyBps: 2100,
      evidenceHash:
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      nonce: 101n,
      expiry: 1800000000n,
    };

    const dummySignature =
      '0x555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555551b';

    const calldata = encodeFunctionData({
      abi: campaignEscrowAbi,
      functionName: 'releaseMilestone',
      args: [
        {
          clipId: mockAttestation.clipId,
          campaignId: mockAttestation.campaignId,
          clipper: mockAttestation.clipper,
          videoIdHash: mockAttestation.videoIdHash,
          verifiedViews: mockAttestation.verifiedViews,
          sourceMatchBps: mockAttestation.sourceMatchBps,
          safetyBps: mockAttestation.safetyBps,
          anomalyBps: mockAttestation.anomalyBps,
          evidenceHash: mockAttestation.evidenceHash,
          nonce: mockAttestation.nonce,
          expiry: mockAttestation.expiry,
        },
        dummySignature,
      ],
    });

    expect(calldata).toMatch(/^0x[a-f0-9]+$/);
    expect(calldata.length).toBeGreaterThan(100);
  });

  it('encodes createCampaign calldata with BNB native support', () => {
    const calldata = encodeFunctionData({
      abi: campaignEscrowAbi,
      functionName: 'createCampaign',
      args: [
        '0x0000000000000000000000000000000000000000',
        50000000n,
        300000n,
        15000000n,
        1000,
        1800000000n,
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
      ],
    });

    expect(calldata).toMatch(/^0x[a-f0-9]+$/);
  });
});
