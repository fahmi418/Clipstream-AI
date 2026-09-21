import type { IDatabaseRepository } from '../db/repository.js';
import type { IChainService } from '../services/chain.service.js';

export class ReconcileChainWorker {
  constructor(
    private readonly repo: IDatabaseRepository,
    private readonly chain: IChainService
  ) {}

  async reconcileClip(clipId: string): Promise<boolean> {
    const clip = await this.repo.getClipById(clipId);
    if (!clip || !clip.onchainId) return false;

    const onchain = await this.chain.getClipOnchain(clip.onchainId);

    if (
      onchain.paidViews !== clip.paidViews ||
      onchain.totalPaid !== clip.releasedAmount ||
      onchain.holdback !== clip.holdbackAmount
    ) {
      await this.repo.updateClip(clipId, {
        paidViews: onchain.paidViews,
        releasedAmount: onchain.totalPaid,
        holdbackAmount: onchain.holdback,
      });
      return true;
    }

    return false;
  }
}
