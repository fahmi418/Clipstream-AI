import { keccak256, encodePacked } from 'viem';
import { getDatabaseRepository } from './client.js';

export async function seedDemoData(): Promise<void> {
  const repo = getDatabaseRepository();

  // 1. Create Brands & Clippers
  const brandUser = await repo.upsertUser({
    privyDid: 'did:privy:brand-techno-42',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    displayName: 'Tech Podcast Studio',
    email: 'brand@podcastbincang.id',
  });

  const clipperUser = await repo.upsertUser({
    privyDid: 'did:privy:clipper-pro-indo',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    displayName: 'Budi Clipper Indo',
    email: 'budi@clipper.id',
  });

  // 2. Source Videos
  const srcVideo1 = await repo.createSourceVideo({
    platform: 'youtube',
    videoId: 'srcVideo001',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'srcVideo001'])),
    title: 'Podcast Bincang Teknologi — Episode 42: Web3 & Autonomous AI Agents',
    durationSec: 2400,
    transcript:
      'Halo semua, selamat datang di episode 42 podcast bincang teknologi. Hari ini kita membahas tuntas bagaimana autonomous AI agent merevolusi ekonomi kreator dan Web3 di Indonesia.',
    transcriptHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    transcriptStatus: 'READY',
  });

  const srcVideo2 = await repo.createSourceVideo({
    platform: 'youtube',
    videoId: 'srcVideo002',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'srcVideo002'])),
    title: 'Kopi Nusantara: Rahasia Biji Kopi Gayo dan Robusta Pilihan',
    durationSec: 1800,
    transcript:
      'Kopi Nusantara menghadirkan cita rasa otentik kopi Indonesia dari pegunungan Gayo hingga Toraja.',
    transcriptHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    transcriptStatus: 'READY',
  });

  // 3. Campaign 1: Podcast (Native BNB / Escrow)
  const campaign1 = await repo.createCampaign({
    onchainId: 1n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo1.id,
    title: 'Podcast Bincang Teknologi — Episode 42',
    rules:
      'Klip harus memotong dari episode ini. Tanpa SARA. Tanpa klaim medis atau finansial. Judul tidak boleh clickbait yang tidak sesuai isi.',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Native BNB
    cpmRate: 300000n,
    totalBudget: 50000000n,
    maxPayoutPerClip: 15000000n,
    minViews: 1000,
    deadline: new Date(Date.now() + 14 * 86400_000),
    sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    status: 'ACTIVE',
    createTxHash: '0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999',
    activatedAt: new Date(),
  });

  // 4. Campaign 2: Brand F&B (BEP-20 / Stablecoin)
  const campaign2 = await repo.createCampaign({
    onchainId: 2n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo2.id,
    title: 'Kopi Nusantara — Kampanye Rasa Baru',
    rules:
      'Tanpa perbandingan dengan merek kompetitor. Tanpa klaim kesehatan. Wajib menyebut nama produk dengan benar.',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955', // BEP-20
    cpmRate: 500000n,
    totalBudget: 30000000n,
    maxPayoutPerClip: 10000000n,
    minViews: 2000,
    deadline: new Date(Date.now() + 10 * 86400_000),
    sourceHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    rulesHash: '0x6666666666666666666666666666666666666666666666666666666666666666',
    status: 'ACTIVE',
    createTxHash: '0xbbbbccccddddeeeeffff0000111122223333444455556666777788889999aaaa',
    activatedAt: new Date(),
  });

  // 5. Participants
  await repo.joinCampaign(campaign1.id, clipperUser.id, 'CS-1-a9f3c1');
  await repo.joinCampaign(campaign2.id, clipperUser.id, 'CS-2-b8e2d4');

  // 6. Demo Clips (SCHEMA §12)
  // Klip A: ACTIVE, sudah dibayar (Happy path)
  await repo.createClip({
    onchainId: 101n,
    campaignId: campaign1.id,
    clipperId: clipperUser.id,
    platform: 'youtube',
    videoId: 'clipDemo001',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'clipDemo001'])),
    url: 'https://youtube.com/shorts/clipDemo001',
    verificationCode: 'CS-1-a9f3c1',
    publishedAt: new Date(Date.now() - 3 * 86400_000),
    durationSec: 45,
    transcript: 'Potongan seru diskusi AI agent dan ekonomi Web3 di Indonesia.',
    transcriptHash: '0x7777777777777777777777777777777777777777777777777777777777777777',
    paidViews: 15000,
    releasedAmount: 3150000n, // 70% immediate
    holdbackAmount: 1350000n, // 30% holdback
    holdbackUnlockAt: new Date(Date.now() + 48 * 3600_000),
    status: 'ACTIVE',
    rejectionCode: null,
    rejectionReason: null,
    registerTxHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    lastVerifiedAt: new Date(Date.now() - 3600_000),
    nextCheckAt: new Date(Date.now() + 1800_000),
  });

  // Klip B: REJECTED / SOURCE_MISMATCH (Key demo moment - clip from unrelated video)
  await repo.createClip({
    onchainId: null,
    campaignId: campaign1.id,
    clipperId: clipperUser.id,
    platform: 'youtube',
    videoId: 'clipDemo002',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'clipDemo002'])),
    url: 'https://youtube.com/shorts/clipDemo002',
    verificationCode: 'CS-1-a9f3c1',
    publishedAt: new Date(Date.now() - 2 * 86400_000),
    durationSec: 40,
    transcript: 'Review gameplay game petualangan terbaru tahun 2026.',
    transcriptHash: '0x8888888888888888888888888888888888888888888888888888888888888888',
    paidViews: 0,
    releasedAmount: 0n,
    holdbackAmount: 0n,
    holdbackUnlockAt: null,
    status: 'REJECTED',
    rejectionCode: 'SOURCE_MISMATCH',
    rejectionReason: 'Kecocokan konten sumber 24% (di bawah batas minimum 72%)',
    registerTxHash: null,
    lastVerifiedAt: new Date(Date.now() - 2 * 86400_000),
    nextCheckAt: null,
  });

  // Klip C: REJECTED / SAFETY_VIOLATION (Brand safety violation demo)
  await repo.createClip({
    onchainId: null,
    campaignId: campaign2.id,
    clipperId: clipperUser.id,
    platform: 'youtube',
    videoId: 'clipDemo003',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'clipDemo003'])),
    url: 'https://youtube.com/shorts/clipDemo003',
    verificationCode: 'CS-2-b8e2d4',
    publishedAt: new Date(Date.now() - 86400_000),
    durationSec: 50,
    transcript: 'Kopi ini terbukti bisa menyembuhkan penyakit diabetes secara instan.',
    transcriptHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
    paidViews: 0,
    releasedAmount: 0n,
    holdbackAmount: 0n,
    holdbackUnlockAt: null,
    status: 'REJECTED',
    rejectionCode: 'SAFETY_VIOLATION',
    rejectionReason:
      'Pelanggaran rubrik: klaim kesehatan medis tidak berizin ditemukan dalam narasi klip',
    registerTxHash: null,
    lastVerifiedAt: new Date(Date.now() - 86400_000),
    nextCheckAt: null,
  });

  // Klip D: PENDING_VIEWS (System waiting, not rejecting)
  await repo.createClip({
    onchainId: null,
    campaignId: campaign1.id,
    clipperId: clipperUser.id,
    platform: 'youtube',
    videoId: 'clipDemo004',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'clipDemo004'])),
    url: 'https://youtube.com/shorts/clipDemo004',
    verificationCode: 'CS-1-a9f3c1',
    publishedAt: new Date(Date.now() - 12 * 3600_000),
    durationSec: 35,
    transcript: 'Bagian diskusi Web3 yang dipotong dari episode 42.',
    transcriptHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    paidViews: 0,
    releasedAmount: 0n,
    holdbackAmount: 0n,
    holdbackUnlockAt: null,
    status: 'PENDING_VIEWS',
    rejectionCode: null,
    rejectionReason: 'Jumlah views (650) belum mencapai batas minimum kampanye (1.000 views)',
    registerTxHash: null,
    lastVerifiedAt: new Date(Date.now() - 12 * 3600_000),
    nextCheckAt: new Date(Date.now() + 1800_000),
  });

  // Klip E: ACTIVE dengan holdback matang (Demonstrasi claimHoldback)
  await repo.createClip({
    onchainId: 105n,
    campaignId: campaign1.id,
    clipperId: clipperUser.id,
    platform: 'youtube',
    videoId: 'clipDemo005',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'clipDemo005'])),
    url: 'https://youtube.com/shorts/clipDemo005',
    verificationCode: 'CS-1-a9f3c1',
    publishedAt: new Date(Date.now() - 5 * 86400_000),
    durationSec: 55,
    transcript: 'Pembahasan lengkap AI verification agent dan smart contract escrow.',
    transcriptHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    paidViews: 25000,
    releasedAmount: 5250000n,
    holdbackAmount: 2250000n,
    holdbackUnlockAt: new Date(Date.now() - 3600_000), // Matured! Ready to claim
    status: 'ACTIVE',
    rejectionCode: null,
    rejectionReason: null,
    registerTxHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    lastVerifiedAt: new Date(Date.now() - 4 * 86400_000),
    nextCheckAt: null,
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  seedDemoData()
    .then(() => {
      console.log('Seed demo data created successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed demo data:', err);
      process.exit(1);
    });
}
