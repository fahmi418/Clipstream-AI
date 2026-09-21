import type { Attestation } from '@clipstream/shared';
import { CampaignEscrowClient } from '@clipstream/contracts-sdk';
import { opBNBTestnet } from 'viem/chains';

export interface IChainService {
  getClipperApprovalRate(clipperAddress: `0x${string}`): Promise<number>;
  getCampaignBudget(onchainId: bigint): Promise<{ total: bigint; remaining: bigint }>;
  getClipOnchain(onchainId: bigint): Promise<{ paidViews: number; totalPaid: bigint; holdback: bigint }>;
  releaseMilestone(
    attestation: Attestation,
    signature: `0x${string}`
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }>;
  claimHoldback(
    clipOnchainId: bigint
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }>;
}

export class MockChainService implements IChainService {
  private clipperRates = new Map<string, number>();
  private clips = new Map<bigint, { paidViews: number; totalPaid: bigint; holdback: bigint }>();

  setClipperApprovalRate(address: string, rate: number): void {
    this.clipperRates.set(address.toLowerCase(), rate);
  }

  async getClipperApprovalRate(clipperAddress: `0x${string}`): Promise<number> {
    return this.clipperRates.get(clipperAddress.toLowerCase()) ?? 0.85;
  }

  async getCampaignBudget(onchainId: bigint): Promise<{ total: bigint; remaining: bigint }> {
    return {
      total: 50000000n,
      remaining: 45000000n,
    };
  }

  async getClipOnchain(
    onchainId: bigint
  ): Promise<{ paidViews: number; totalPaid: bigint; holdback: bigint }> {
    return (
      this.clips.get(onchainId) ?? {
        paidViews: 0,
        totalPaid: 0n,
        holdback: 0n,
      }
    );
  }

  async releaseMilestone(
    attestation: Attestation,
    _signature: `0x${string}`
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }> {
    const existing = this.clips.get(attestation.clipId) ?? {
      paidViews: 0,
      totalPaid: 0n,
      holdback: 0n,
    };
    existing.paidViews = attestation.verifiedViews;
    this.clips.set(attestation.clipId, existing);

    return {
      txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      blockNumber: 123456n,
      gasUsed: 129000n,
    };
  }

  async claimHoldback(
    _clipOnchainId: bigint
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }> {
    return {
      txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      blockNumber: 123457n,
      gasUsed: 65000n,
    };
  }
}

export interface ViemChainServiceConfig {
  rpcUrl: string;
  escrowAddress: `0x${string}`;
  registryAddress?: `0x${string}`;
  privateKey?: `0x${string}`;
}

export class ViemChainService implements IChainService {
  private client: CampaignEscrowClient;

  constructor(config: ViemChainServiceConfig) {
    this.client = new CampaignEscrowClient({
      rpcUrl: config.rpcUrl,
      escrowAddress: config.escrowAddress,
      registryAddress: config.registryAddress,
      privateKey: config.privateKey,
      chain: opBNBTestnet,
    });
  }

  async getClipperApprovalRate(clipperAddress: `0x${string}`): Promise<number> {
    return this.client.getClipperApprovalRate(clipperAddress);
  }

  async getCampaignBudget(onchainId: bigint): Promise<{ total: bigint; remaining: bigint }> {
    const campaign = await this.client.getCampaign(onchainId);
    return {
      total: campaign.totalBudget,
      remaining: campaign.remaining,
    };
  }

  async getClipOnchain(
    onchainId: bigint
  ): Promise<{ paidViews: number; totalPaid: bigint; holdback: bigint }> {
    const clip = await this.client.getClip(onchainId);
    return {
      paidViews: clip.paidViews,
      totalPaid: clip.releasedAmount,
      holdback: clip.holdbackAmount,
    };
  }

  async releaseMilestone(
    attestation: Attestation,
    signature: `0x${string}`
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }> {
    const { txHash } = await this.client.releaseMilestone(attestation, signature);
    const receipt = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash });
    return {
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }

  async claimHoldback(
    clipOnchainId: bigint
  ): Promise<{ txHash: `0x${string}`; blockNumber: bigint; gasUsed: bigint }> {
    const { txHash } = await this.client.claimHoldback(clipOnchainId);
    const receipt = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash });
    return {
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }
}

let activeChainService: IChainService | null = null;

export function getChainService(): IChainService {
  if (!activeChainService) {
    if (process.env.CAMPAIGN_ESCROW_ADDRESS && process.env.RPC_URL) {
      activeChainService = new ViemChainService({
        rpcUrl: process.env.RPC_URL,
        escrowAddress: process.env.CAMPAIGN_ESCROW_ADDRESS as `0x${string}`,
        registryAddress: process.env.CLIPPER_REGISTRY_ADDRESS as `0x${string}` | undefined,
        privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined,
      });
    } else {
      activeChainService = new MockChainService();
    }
  }
  return activeChainService;
}

export function setChainService(service: IChainService): void {
  activeChainService = service;
}
