# Phase Plan: Remotion Video SVG Assets & UI Vector Graphics Extraction

**Objective:**
Membuat dan mengekstrak katalog lengkap aset SVG berstandar produksi yang dibutuhkan untuk video demo motion graphic ClipStream AI (Phase 3 Remotion). Seluruh aset dioptimalkan untuk performa rendering berbasis kode di Remotion, responsif pada resolusi 1080p/4K, dan selaras dengan aset asli dari codebase ClipStream (`apps/web`).

---

## 1. Lingkup Aset yang Dibuat

### A. Logos & Protocol Emblems (`video_demo/assets/svg/logos/`)
- `clipstream-flame.svg` — Icon Phoenix Flame ClipStream AI (gradien oranye-emas).
- `clipstream-logo-full.svg` — Full lockup logo + wordmark ClipStream.ai.
- `bnb-chain.svg` — Logo resmi BNB Chain / opBNB (emas BNB `#F3BA2F`).
- `tether-usdt.svg` — Token Tether USDT (hijau tosca `#26A17B`).
- `poko-offramp.svg` — Logo Poko Web3-to-Fiat checkout protocol.
- `dana.svg` — Logo resmi DANA E-Wallet Indonesia (`#118EEA`).
- `gopay.svg` — Logo resmi GoPay Indonesia (`#00AED6`).
- `bca.svg` — Logo Bank Central Asia (`#003893`).
- `youtube-shorts.svg` — Lencana YouTube Shorts (merah khas `#FF0000`).
- `tiktok.svg` — Lencana TikTok dengan efek double-tone cyan/magenta.
- `gemini-sparkle.svg` — Bintang 4-sudut Google Gemini AI (gradien biru-ungu).
- `whisper-ai.svg` — Icon OpenAI Whisper / Speech-to-Text audio pulse.

### B. Motion Graphic UI Components (`video_demo/assets/svg/ui/`)
- `copilot-pill.svg` — Tombol pill hitam bercahaya `[ ⚡ ClipStream Copilot ]` (mirip tombol Canvas Google Gemini).
- `macos-window-chrome.svg` — Topbar window macOS dengan traffic light dots & tab antrean verifikasi.
- `audio-waveform-bars.svg` — Spektrum gelombang suara audio Whisper AI multi-bar.
- `scanner-hud-9x16.svg` — Frame HUD vertikal 9:16 dengan garis laser pemindai dan target lock watermark sponsor.
- `oracle-metrics-card.svg` — 3 kartu metrik Oracle: 78.200 views, 99.2% human organik, Rp 24.500 CPM.
- `escrow-split-7030.svg` — Diagram visual perpecahan 70% Instant Payout vs 30% Timelock Holdback.
- `smartphone-dana-push.svg` — Mockup frame smartphone dengan banner notifikasi DANA Rp 513.450.
- `verified-stamp-3d.svg` — Stempel heksagonal 3D *"100% TERVERIFIKASI AI AGENT"*.
- `bscscan-receipt.svg` — Struk transaksi blockchain opBNB (TxHash, gas fee, success badge).
- `cursor-click.svg` — Kursor mouse minimalis hitam-putih untuk menganimasikan interaksi klik.

### C. Dokumentasi & Katalog Aset
- `video_demo/assets/ASSETS_CATALOG.md` — Direktori indeks dan panduan integrasi langsung ke komponen React Remotion.

---

## 2. Kriteria Keberhasilan (Verification Criteria)
1. Seluruh file SVG valid XML dan bebas dari error viewBox.
2. Warna dan styling 100% konsisten dengan desain sistem ClipStream di `PRD-ClipStream-AI.md` dan `apps/web`.
3. Struktur direktori tertata rapi di `video_demo/assets/`.
4. Siap dibaca langsung oleh subagent maupun komponen Remotion di Phase 3.
