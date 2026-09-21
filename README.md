# ClipStream AI

> **Autonomous AI Agent Verification & Trustless Escrow Protocol for Video Creators on BNB Chain**

ClipStream AI adalah protokol web3 terdesentralisasi yang menjembatani brand dan kreator klip video (*clippers*) melalui kombinasi **Autonomous AI Verification Agent** dan **Smart Contract Escrow**. Brand mengunci anggaran kampanye di smart contract, AI Agent memverifikasi keaslian serta metrik video secara independen dalam 45 detik, dan pembayaran USDT dicairkan secara instan tanpa perantara manual.

---

## 📑 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Struktur Monorepo](#-struktur-monorepo)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Alur Kerja Protokol](#-alur-kerja-protokol)
- [Prasyarat](#-prasyarat)
- [Panduan Memulai Cepat](#-panduan-memulai-cepat)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Pengujian (Testing)](#-pengujian-testing)
- [Smart Contracts](#-smart-contracts)
- [Keamanan & Anti-Fraud](#-keamanan--anti-fraud)

---

## ✨ Fitur Utama

- **100% Trustless Escrow**: Budget kampanye dikunci secara on-chain pada smart contract `CampaignEscrow.sol` di BNB Chain / opBNB Testnet. Brand tidak dapat membatalkan pembayaran sepihak yang sudah menjadi hak kreator.
- **7-Stage Autonomous AI Verification**: Pipeline multimodal menggunakan Whisper ASR dan Google Gemini AI untuk memverifikasi audio fingerprinting, transkripsi, kesesuaian brand, safety filtering, dan deteksi anomali views.
- **Model Pembayaran 70/30 Otomatis**: 70% dana dicairkan seketika ke wallet kreator begitu klip lolos verifikasi, sedangkan 30% sisanya ditahan dalam buffer holdback selama 3 hari untuk menjamin stabilitas metrik video.
- **Bebas Gas Fee Bagi Clipper**: Transaksi klaim kreator didukung melalui EIP-712 typed signature dan relayer gas sponsorship.
- **Desain Antarmuka Premium**: Frontend Next.js 15 dengan tipografi modern, kartu pastel bento grid, audio spectrum simulation, dan visual hierarki berbasis sistem desain kelas dunia.

---

## 📁 Struktur Monorepo

```
clipstream-ai/
├── apps/
│   ├── api/                 # Fastify REST API, worker queue, SSE live stream & PostgreSQL/Drizzle
│   └── web/                 # Next.js 15 frontend web app (Tailwind CSS, Wagmi, Privy, App Router)
├── contracts/               # Smart contracts (Solidity 0.8.24, Foundry test suite)
│   ├── src/                 # CampaignEscrow.sol, ClipperRegistry.sol, MockUSDT.sol
│   └── test/                # Unit, invariant, fuzz, dan scenario attack tests
├── packages/
│   ├── agent/               # Autonomous AI Verification Engine (7-stage pipeline, EIP-712 signer)
│   ├── contracts-sdk/       # Type-safe Viem contract wrapper dan event log indexer
│   └── shared/              # Shared types, Zod schemas, constants & validation utilities
├── reference/               # UI/UX design references & assets
├── .env.example             # Master environment template
├── pnpm-workspace.yaml      # Monorepo workspace configuration
└── README.md                # Dokumentasi utama proyek
```

---

## 🏗️ Arsitektur Sistem

```mermaid
flowchart TD
    subgraph Brand_Portal["1. Brand Portal"]
        A[Brand Buat Campaign] -->|Deposit USDT| B[CampaignEscrow.sol]
    end

    subgraph Clipper_Flow["2. Clipper Flow"]
        C[Kreator Submit Link YouTube Shorts] -->|Post Link + Kode Verifikasi| D[Fastify API]
    end

    subgraph AI_Agent["3. Autonomous AI Verifier Pipeline"]
        D --> E[Stage 1: Fetch Video & Metrics]
        E --> F[Stage 2: Whisper Audio ASR]
        F --> G[Stage 3: Gemini Semantic Match]
        G --> H[Stage 4: Brand Safety & Anti-Fraud]
        H --> I[Stage 5: IPFS Proof CID Generation]
        I --> J[Stage 6: EIP-712 Attestation Signature]
    end

    subgraph Settlement["4. On-Chain Settlement"]
        J -->|Klaim Payout| K[CampaignEscrow Contract]
        K -->|70% USDT Instan| L[Wallet Clipper]
        K -->|30% USDT Holdback 3 Hari| M[Holdback Pool]
    end
```

---

## 🔄 Alur Kerja Protokol

1. **Brand Membuat Campaign**: Brand menentukan budget pool, CPM rate (tarif per 1.000 views), batas minimum views, dan instruksi konten. Budget dikunci langsung di smart contract.
2. **Kreator Mengunggah Klip**: Kreator membuat video pendek (YouTube Shorts) dan menyertakan kode verifikasi unik di deskripsi video untuk membuktikan kepemilikan.
3. **Verifikasi AI Otomatis (30-45 Detik)**:
   - Mengambil metrik views riil dari YouTube Data API.
   - Mengonversi audio video ke teks menggunakan Whisper ASR.
   - Menganalisis kesesuaian pesan brand dan kepatuhan aturan menggunakan Gemini 2.5.
   - Menyimpan rekaman bukti audit ke IPFS dan menandatangani bukti kelayakan via signature EIP-712.
4. **Pencairan Dana (Instant Payout)**:
   - 70% saldo reward langsung masuk ke wallet kreator.
   - 30% dana masuk ke sistem holdback 3 hari untuk memastikan video tidak dihapus setelah pembayaran.

---

## 💻 Prasyarat

Sebelum menjalankan proyek, pastikan perangkat Anda telah terpasang:
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Foundry**: `forge` dan `cast` (untuk smart contracts)
- **PostgreSQL**: `>= 15` (untuk database API)
- **Redis**: `>= 7` (untuk antrean background worker)

---

## 🚀 Panduan Memulai Cepat

### 1. Kloning Repositori & Install Dependensi
```bash
git clone https://github.com/Ethermind-Agency/Clipstream-AI.git
cd Clipstream-AI
pnpm install
```

### 2. Salin File Konfigurasi Environment
```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Build Seluruh Paket TypeScript
```bash
pnpm run build
```

### 4. Jalankan Smart Contract Tests (Foundry)
```bash
cd contracts
forge test
cd ..
```

### 5. Jalankan Service Backend API
```bash
# Menjalankan Fastify API server pada http://localhost:3001
pnpm --filter @clipstream/api dev
```

*(Opsional)* Jalankan database seeding untuk data pengujian awal:
```bash
pnpm --filter @clipstream/api run seed
```

### 6. Jalankan Frontend Web App
```bash
# Menjalankan Next.js frontend pada http://localhost:3000
pnpm --filter @clipstream/web dev
```

---

## ⚙️ Konfigurasi Environment

Contoh konfigurasi utama pada `.env`:

```env
# ── Network & Blockchain ──
CHAIN_ID=97
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
CAMPAIGN_ESCROW_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
CLIPPER_REGISTRY_ADDRESS=0xCf7Ed3236131e56266c1f20a483844149751493A
USDT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# ── AI Agent & Signer Keys ──
AGENT_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# ── Database & Cache ──
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clipstream
REDIS_URL=redis://localhost:6379

# ── App Endpoints ──
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

---

## 🧪 Pengujian (Testing)

Proyek ini dilengkapi dengan cakupan pengujian komprehensif dari level smart contract hingga end-to-end API:

### 1. Smart Contract Test Suite
```bash
cd contracts
forge test -vvv
```
Mencakup pengujian unit, scenario serangan (reentrancy, unauthorized drain, premature holdback unlock), dan fuzzing invariant.

### 2. TypeScript Packages & API Test Suite
```bash
# Menjalankan test suite pada agent, api, dan contracts-sdk
pnpm run test
```

### 3. Web Frontend Production Build Check
```bash
pnpm --filter @clipstream/web build
```

---

## 📜 Smart Contracts

Smart contract ClipStream AI diimplementasikan menggunakan Solidity `0.8.24` dengan audit pattern OpenZeppelin:

- **`CampaignEscrow.sol`**: Mengelola locking budget USDT dari brand, validasi signature attestation EIP-712 dari AI agent verifikator, split payout 70% instan, dan pelepasan holdback buffer 30% setelah masa tenggang (3 hari).
- **`ClipperRegistry.sol`**: On-chain registry untuk melacak reputasi clipper, total klaim terverifikasi, serta riwayat pelanggaran / blacklist.
- **`MockUSDT.sol`**: Mock token BEP-20 untuk keperluan pengujian dan simulasi transfer dana pada testnet.

---

## 🛡️ Keamanan & Anti-Fraud

1. **Anti-Sybil Verification Code**: Setiap clipper wajib menyertakan hash kode submission unik pada deskripsi video agar video orang lain tidak dapat diklaim ulang.
2. **Audio Spectral Fingerprinting**: Whisper ASR membandingkan kesamaan audio dengan klip yang pernah disubmit untuk mencegah re-upload.
3. **Attestation EIP-712 Nonce Tracking**: Mencegah replay attack pada transaksi pencairan dana on-chain.
4. **Reentrancy Protection**: Seluruh fungsi transfer dana on-chain dilindungi oleh `ReentrancyGuardUpgradeable` dan mengikuti pola *Checks-Effects-Interactions*.

---

## 🏆 Hackathon Metadata

- **Event**: BNB Chain 2026 AI Agent + Consumer Apps Hackathon
- **Target Network**: BNB Smart Chain / opBNB Testnet
- **Track**: AI Agent & Decentralized Consumer Economy
- **Tim**: Ethermind Agency

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
