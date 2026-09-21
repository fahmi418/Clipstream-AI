import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Account,
  type Transport,
  type Chain,
} from 'viem';
import { opBNBTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { campaignEscrowAbi } from './abis/CampaignEscrow.js';
import { clipperRegistryAbi } from './abis/ClipperRegistry.js';
import type { Attestation } from '@clipstream/shared';

export interface ContractConfig {
  rpcUrl: string;
  chain?: Chain;
  escrowAddress: `0x${string}`;
  registryAddress?: `0x${string}`;
  privateKey?: `0x${string}`;
}

export interface CreateCampaignArgs {
  token: `0x${string}`;
  totalBudget: bigint;
  cpmRate: bigint;
  maxPayoutPerClip: bigint;
  minViews: number;
  deadline: bigint;
  sourceHash: `0x${string}`;
  rulesHash: `0x${string}`;
}

export class CampaignEscrowClient {
  public readonly chain: Chain;
  public readonly publicClient: PublicClient;
  public readonly walletClient?: WalletClient<Transport, Chain, Account>;
  public readonly escrowAddress: `0x${string}`;
  public readonly registryAddress?: `0x${string}`;

  constructor(config: ContractConfig) {
    this.chain = config.chain || opBNBTestnet;
    this.escrowAddress = config.escrowAddress;
    this.registryAddress = config.registryAddress;

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(config.rpcUrl),
    });

    if (config.privateKey) {
      const account = privateKeyToAccount(config.privateKey);
      this.walletClient = createWalletClient({
        account,
        chain: this.chain,
        transport: http(config.rpcUrl),
      });
    }
  }

  async createCampaign(
    args: CreateCampaignArgs,
    value: bigint = 0n
  ): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'createCampaign',
      args: [
        args.token,
        args.totalBudget,
        args.cpmRate,
        args.maxPayoutPerClip,
        args.minViews,
        args.deadline,
        args.sourceHash,
        args.rulesHash,
      ],
      value,
    });

    return { txHash: hash };
  }

  async registerClip(
    campaignId: bigint,
    clipper: `0x${string}`,
    videoIdHash: `0x${string}`
  ): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'registerClip',
      args: [campaignId, clipper, videoIdHash],
    });

    return { txHash: hash };
  }

  async releaseMilestone(
    attestation: Attestation,
    signature: `0x${string}`
  ): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'releaseMilestone',
      args: [
        {
          clipId: attestation.clipId,
          campaignId: attestation.campaignId,
          clipper: attestation.clipper,
          videoIdHash: attestation.videoIdHash,
          verifiedViews: attestation.verifiedViews,
          sourceMatchBps: attestation.sourceMatchBps,
          safetyBps: attestation.safetyBps,
          anomalyBps: attestation.anomalyBps,
          evidenceHash: attestation.evidenceHash,
          nonce: attestation.nonce,
          expiry: attestation.expiry,
        },
        signature,
      ],
    });

    return { txHash: hash };
  }

  async claimHoldback(clipId: bigint): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'claimHoldback',
      args: [clipId],
    });

    return { txHash: hash };
  }

  async flagClip(
    clipId: bigint,
    reasonHash: `0x${string}`
  ): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'flagClip',
      args: [clipId, reasonHash],
    });

    return { txHash: hash };
  }

  async topUpCampaign(
    campaignId: bigint,
    amount: bigint,
    value: bigint = 0n
  ): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'topUpCampaign',
      args: [campaignId, amount],
      value,
    });

    return { txHash: hash };
  }

  async withdrawRemaining(campaignId: bigint): Promise<{ txHash: `0x${string}` }> {
    if (!this.walletClient) throw new Error('WalletClient tidak diinisialisasi');

    const hash = await this.walletClient.writeContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'withdrawRemaining',
      args: [campaignId],
    });

    return { txHash: hash };
  }

  async getCampaign(campaignId: bigint) {
    return this.publicClient.readContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'getCampaign',
      args: [campaignId],
    });
  }

  async getClip(clipId: bigint) {
    return this.publicClient.readContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'getClip',
      args: [clipId],
    });
  }

  async getWithdrawnByBrand(campaignId: bigint): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'withdrawnByBrand',
      args: [campaignId],
    });
  }

  async isNonceUsed(nonce: bigint): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.escrowAddress,
      abi: campaignEscrowAbi,
      functionName: 'usedNonce',
      args: [nonce],
    });
  }

  async getClipperApprovalRate(clipper: `0x${string}`): Promise<number> {
    if (!this.registryAddress) return 0.85;

    const rateBps = await this.publicClient.readContract({
      address: this.registryAddress,
      abi: clipperRegistryAbi,
      functionName: 'approvalRate',
      args: [clipper],
    });

    return Number(rateBps) / 10000;
  }
}
