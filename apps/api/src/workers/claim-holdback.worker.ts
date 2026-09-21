import type { IDatabaseRepository } from '../db/repository.js';
import type { IChainService } from '../services/chain.service.js';

export class ClaimHoldbackWorker {
  constructor(
    private readonly repo: IDatabaseRepository,
    private readonly chain: IChainService
  ) {}

  async runClaim(): Promise<number> {
    const now = new Date();
    const dueClips = await this.repo.listClipsDueForHoldback(now, 50);
    let claimedCount = 0;

    for (const clip of dueClips) {
      if (!clip.onchainId) continue;
      if (clip.status !== 'ACTIVE') continue;

      try {
        const tx = await this.chain.claimHoldback(clip.onchainId);

        await this.repo.updateClip(clip.id, {
          releasedAmount: clip.releasedAmount + clip.holdbackAmount,
          holdbackAmount: 0n,
          holdbackUnlockAt: null,
        });

        claimedCount++;
      } catch {
        // Continue processing others
      }
    }

    return claimedCount;
  }
}
