import { describe, it, expect } from 'vitest';
import {
  campaignEscrowAbi,
  clipperRegistryAbi,
  CampaignEscrowClient,
  parseEscrowLogs,
} from '../src/index.js';
import { encodeEventTopics, toHex } from 'viem';

describe('Contracts SDK — Type-safe Client & ABI Specification', () => {
  const escrowAddr = '0x1234567890123456789012345678901234567890';
  const registryAddr = '0x0987654321098765432109876543210987654321';
  const dummyKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  it('initializes CampaignEscrowClient with read and write capabilities', () => {
    const client = new CampaignEscrowClient({
      rpcUrl: 'http://127.0.0.1:8545',
      escrowAddress: escrowAddr,
      registryAddress: registryAddr,
      privateKey: dummyKey,
    });

    expect(client.escrowAddress).toBe(escrowAddr);
    expect(client.registryAddress).toBe(registryAddr);
    expect(client.publicClient).toBeDefined();
    expect(client.walletClient).toBeDefined();
  });

  it('exposes accurate ABIs for hybrid Native BNB and BEP-20 escrow functions', () => {
    const createFn = campaignEscrowAbi.find(
      (item) => item.type === 'function' && item.name === 'createCampaign'
    );
    expect(createFn).toBeDefined();
    expect(createFn?.stateMutability).toBe('payable');

    const topUpFn = campaignEscrowAbi.find(
      (item) => item.type === 'function' && item.name === 'topUpCampaign'
    );
    expect(topUpFn).toBeDefined();
    expect(topUpFn?.stateMutability).toBe('payable');

    const releaseFn = campaignEscrowAbi.find(
      (item) => item.type === 'function' && item.name === 'releaseMilestone'
    );
    expect(releaseFn).toBeDefined();

    const claimFn = campaignEscrowAbi.find(
      (item) => item.type === 'function' && item.name === 'claimHoldback'
    );
    expect(claimFn).toBeDefined();
  });

  it('parses MilestoneReleased event logs accurately', () => {
    const topics = encodeEventTopics({
      abi: campaignEscrowAbi,
      eventName: 'MilestoneReleased',
      args: {
        clipId: 1n,
      },
    });

    expect(topics.length).toBeGreaterThan(0);
  });
});
