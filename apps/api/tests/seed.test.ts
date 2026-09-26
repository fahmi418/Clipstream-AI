import { describe, it, expect, beforeEach } from 'vitest';
import { setDatabaseRepository, getDatabaseRepository } from '../src/db/client.js';
import { InMemoryDatabaseRepository } from '../src/db/in-memory.js';
import { seedDemoData } from '../src/db/seed.js';

describe('Demo Seed Data — SCHEMA §12 Compliance', () => {
  beforeEach(() => {
    setDatabaseRepository(new InMemoryDatabaseRepository());
  });

  it('populates demo campaigns and all 5 demo clip scenarios', async () => {
    await seedDemoData();
    const repo = getDatabaseRepository();

    const campaigns = await repo.listCampaigns();
    expect(campaigns.length).toBe(4);

    const camp1 = campaigns.find((c) => c.title.includes('Podcast Bincang Teknologi') || c.id === 'camp-seed-1');
    expect(camp1).toBeDefined();
    expect(camp1?.tokenAddress).toBe('0x0000000000000000000000000000000000000000'); // Native BNB

    const camp2 = campaigns.find((c) => c.title.includes('Kopi Nusantara') || c.id === 'camp-seed-2');
    expect(camp2).toBeDefined();

    const clips1 = await repo.listClipsByCampaign(camp1!.id);
    const clips2 = await repo.listClipsByCampaign(camp2!.id);
    const allClips = [...clips1, ...clips2];
    expect(allClips.length).toBe(5);

    // Klip A: ACTIVE, sudah dibayar
    const clipA = allClips.find((c) => c.videoId === 'clipDemo001');
    expect(clipA?.status).toBe('ACTIVE');
    expect(clipA?.paidViews).toBe(15000);
    expect(clipA?.releasedAmount).toBe(3150000n);

    // Klip B: REJECTED / SOURCE_MISMATCH
    const clipB = allClips.find((c) => c.videoId === 'clipDemo002');
    expect(clipB?.status).toBe('REJECTED');
    expect(clipB?.rejectionCode).toBe('SOURCE_MISMATCH');

    // Klip C: REJECTED / SAFETY_VIOLATION
    const clipC = allClips.find((c) => c.videoId === 'clipDemo003');
    expect(clipC?.status).toBe('REJECTED');
    expect(clipC?.rejectionCode).toBe('SAFETY_VIOLATION');

    // Klip D: PENDING_VIEWS
    const clipD = allClips.find((c) => c.videoId === 'clipDemo004');
    expect(clipD?.status).toBe('PENDING_VIEWS');

    // Klip E: ACTIVE dengan holdback matang
    const clipE = allClips.find((c) => c.videoId === 'clipDemo005');
    expect(clipE?.status).toBe('ACTIVE');
    expect(clipE?.holdbackUnlockAt).toBeDefined();
    expect(clipE!.holdbackUnlockAt!.getTime()).toBeLessThan(Date.now());
  });
});
