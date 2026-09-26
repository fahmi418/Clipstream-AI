import { keccak256, encodePacked } from 'viem';
import bcrypt from 'bcryptjs';
import { getDatabaseRepository } from './client.js';

export async function seedDemoData(): Promise<void> {
  const repo = getDatabaseRepository();
  const demoPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Brands & Clippers
  const brandUser = await repo.upsertUser({
    privyDid: 'did:privy:brand-techno-42',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    displayName: 'Tech Podcast Studio',
    email: 'brand@podcastbincang.id',
    passwordHash: demoPasswordHash,
    role: 'BRAND',
  });

  await repo.upsertUser({
    privyDid: 'did:privy:brand-clipstream-ai',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    displayName: 'Brand Demo Sponsor',
    email: 'brand@clipstream.ai',
    passwordHash: demoPasswordHash,
    role: 'BRAND',
  });

  const clipperUser = await repo.upsertUser({
    privyDid: 'did:privy:clipper-pro-indo',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    displayName: 'Budi Clipper Indo',
    email: 'budi@clipper.id',
    passwordHash: demoPasswordHash,
    role: 'CLIPPER',
  });

  await repo.upsertUser({
    privyDid: 'did:privy:clipper-clipstream-ai',
    walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    displayName: 'Clipper Demo Pro',
    email: 'clipper@clipstream.ai',
    passwordHash: demoPasswordHash,
    role: 'CLIPPER',
  });

  await repo.upsertUser({
    privyDid: 'did:privy:admin-clipstream-ai',
    walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    displayName: 'Clipstream SuperAdmin',
    email: 'admin@clipstream.ai',
    passwordHash: demoPasswordHash,
    role: 'ADMIN',
  });

  // 2. Source Videos
  const srcVideo1 = await repo.createSourceVideo({
    platform: 'youtube',
    videoId: 'SSo_EIwHSd4',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'SSo_EIwHSd4'])),
    title: 'BNB Chain Deep Dive: Kecepatan, Skalabilitas & Arsitektur Smart Contract',
    durationSec: 2400,
    transcript:
      'Halo semua, selamat datang di pembahasan arsitektur BNB Chain. Hari ini kita membahas tuntas bagaimana autonomous AI agent merevolusi ekonomi kreator, gasless swap, dan ekosistem Web3 di Indonesia.',
    transcriptHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    transcriptStatus: 'READY',
  });

  const srcVideo2 = await repo.createSourceVideo({
    platform: 'youtube',
    videoId: 'jxLkbJozKbY',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'jxLkbJozKbY'])),
    title: 'DeFi DEX Architecture: Gasless Swaps, AMM Routing & Security Audits',
    durationSec: 1800,
    transcript:
      'Pelajari cara kerja decentralized exchange generasi terbaru di BNB Chain dengan fitur gasless swap, router teroptimasi, dan keamanan multi-audit.',
    transcriptHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    transcriptStatus: 'READY',
  });

  // 3. Campaign 1: BNB Chain Spotlight
  const campaign1 = await repo.createCampaign({
    id: 'camp-seed-1',
    onchainId: 1n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo1.id,
    title: 'BNB Chain Ecosystem Spotlight',
    description:
      'Highlight inovasi dApps dan proyek Web3 unggulan di BNB Chain. Fokus pada kecepatan transaksi, ekosistem DeFi, dan efisiensi gas fee.',
    rules:
      'Wajib menyertakan watermark sponsor dan tagar #BNBChain. Durasi klip minimal 30 detik. Tanpa SARA.',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Native BNB
    cpmRate: 1748466n,
    totalBudget: 1500000000n,
    remainingBudget: 1120000000n,
    maxPayoutPerClip: 250000000n,
    minViews: 1000,
    deadline: new Date(Date.now() + 14 * 86400_000),
    sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    rulesHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    status: 'ACTIVE',
    createTxHash: '0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999',
    activatedAt: new Date(),
  });

  // 4. Campaign 2: DeFi DEX Launch
  const campaign2 = await repo.createCampaign({
    id: 'camp-seed-2',
    onchainId: 2n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo2.id,
    title: 'DeFi DEX Launch Campaign',
    description:
      'Promosikan peluncuran DEX generasi terbaru di BNB Chain dengan fitur gasless swap dan yield farming terdesentralisasi.',
    rules:
      'Highlight fitur auto-routing dan keamanan kontrak audit. Tanpa klaim keuntungan finansial berlebihan.',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955', // BEP-20
    cpmRate: 1503067n,
    totalBudget: 800000000n,
    remainingBudget: 640000000n,
    maxPayoutPerClip: 150000000n,
    minViews: 1000,
    deadline: new Date(Date.now() + 9 * 86400_000),
    sourceHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    rulesHash: '0x6666666666666666666666666666666666666666666666666666666666666666',
    status: 'ACTIVE',
    createTxHash: '0xbbbbccccddddeeeeffff0000111122223333444455556666777788889999aaaa',
    activatedAt: new Date(),
  });

  // Campaign 3: AI Agent Trading Hackathon
  const campaign3 = await repo.createCampaign({
    id: 'camp-seed-3',
    onchainId: 3n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo1.id,
    title: 'AI Agent Trading Hackathon Teaser',
    description:
      'Bagikan cuplikan highlight tim dan ide autonomous agent terbaik di ajang AI Agent Hackathon 2026. Fokus pada integrasi Web3 & LLM.',
    rules: 'Gunakan visual resolusi 1080p, audio jernih, dan watermark akun clipper terpasang.',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    cpmRate: 1963190n,
    totalBudget: 2000000000n,
    remainingBudget: 1650000000n,
    maxPayoutPerClip: 350000000n,
    minViews: 1500,
    deadline: new Date(Date.now() + 18 * 86400_000),
    sourceHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    rulesHash: '0x7777777777777777777777777777777777777777777777777777777777777777',
    status: 'ACTIVE',
    createTxHash: '0xccccdddd0000111122223333444455556666777788889999aaaabbbbccccdddd',
    activatedAt: new Date(),
  });

  // Campaign 4: Web3 Creator Showcase
  const campaign4 = await repo.createCampaign({
    id: 'camp-seed-4',
    onchainId: 4n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo2.id,
    title: 'Web3 Creator Showcase: Panduan Smart Contract BNB Chain',
    description:
      'Edukasi developer pemula cara deploy contract Solidity dan escrow dengan gas fee murah. Klip harus fokus pada kemudahan ekosistem BNB.',
    rules: 'Highlight biaya gas murah dan kecepatan konfirmasi di BNB Chain.',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955',
    cpmRate: 1595092n,
    totalBudget: 1200000000n,
    remainingBudget: 900000000n,
    maxPayoutPerClip: 200000000n,
    minViews: 1000,
    deadline: new Date(Date.now() + 21 * 86400_000),
    sourceHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    rulesHash: '0x8888888888888888888888888888888888888888888888888888888888888888',
    status: 'ACTIVE',
    createTxHash: '0xdddd0000111122223333444455556666777788889999aaaabbbbccccddddeeee',
    activatedAt: new Date(),
  });

  // Source Video 3: P-Z7Mj9Pifo
  const srcVideo3 = await repo.createSourceVideo({
    platform: 'youtube',
    videoId: 'P-Z7Mj9Pifo',
    videoIdHash: keccak256(encodePacked(['string', 'string'], ['youtube', 'P-Z7Mj9Pifo'])),
    title: 'Panduan AI Whisper & Gemini Vision Clipstream',
    durationSec: 1800,
    transcript:
      'Tutorial lengkap cara kerja AI verifier Clipstream menggunakan OpenAI Whisper audio similarity dan Gemini Vision watermark OCR.',
    transcriptHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
    transcriptStatus: 'READY',
  });

  // Campaign 5: Panduan AI Whisper & Gemini Vision
  const campaign5 = await repo.createCampaign({
    id: 'abd87056-b996-4337-a09e-abdf60b8fd3d',
    onchainId: 5n,
    brandId: brandUser.id,
    sourceVideoId: srcVideo3.id,
    title: 'Panduan AI Whisper & Gemini Vision Clipstream',
    description:
      'Cuplikan seputar validasi OCR dan Whisper AI Clipstream.',
    rules: 'Wajib menyertakan watermark sponsor dan tagar #BNBChain. Tanpa SARA.',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    cpmRate: 306748n,
    totalBudget: 46012269n,
    remainingBudget: 45000000n,
    maxPayoutPerClip: 10000000n,
    minViews: 1000,
    deadline: new Date(Date.now() + 14 * 86400_000),
    sourceHash: '0x33d4748cbeac6139be99c8415876034d5b31de36fb866c04102ec61eb756ec55',
    rulesHash: '0x5a32225c32239c3b0544519d1540ed705e142ecbc05832a9092c0b7a48cc7f4f',
    status: 'ACTIVE',
    createTxHash: '0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b44910283748291023948aa',
    activatedAt: new Date(),
  });

  // 5. Participants
  await repo.joinCampaign(campaign1.id, clipperUser.id, 'CS-1-a9f3c1');
  await repo.joinCampaign(campaign2.id, clipperUser.id, 'CS-2-b8e2d4');
  await repo.joinCampaign(campaign3.id, clipperUser.id, 'CS-3-c7d1e5');
  await repo.joinCampaign(campaign4.id, clipperUser.id, 'CS-4-d6c0f6');
  await repo.joinCampaign(campaign5.id, clipperUser.id, 'CS-5-e8d1a2');

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

if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
  process.argv[1]?.endsWith('seed.js') ||
  process.argv[1]?.endsWith('seed.ts')
) {
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
