import { parseEventLogs, type Log } from 'viem';
import { campaignEscrowAbi } from './abis/CampaignEscrow.js';
import { clipperRegistryAbi } from './abis/ClipperRegistry.js';

export function parseEscrowLogs(logs: Log[]) {
  return parseEventLogs({
    abi: campaignEscrowAbi,
    logs,
  });
}

export function parseRegistryLogs(logs: Log[]) {
  return parseEventLogs({
    abi: clipperRegistryAbi,
    logs,
  });
}
