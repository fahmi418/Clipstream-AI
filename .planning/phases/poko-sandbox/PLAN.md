# Phase Plan: Poko Off-Ramp 100% Authentic Production Simulator & Hackathon Sandbox

**Objective:**
Membangun antarmuka simulasi penarikan (*off-ramp*) yang **100% mirip dengan Poko App SDK versi produksi**, lengkap dengan UI dual-card swap, live FX calculation, breakdown biaya platform 5% & Poko fee ~1.2%, stepper eksekusi 4-tahap, struk transaksi resmi, **notifikasi push virtual smartphone (DANA/BCA)**, serta **faucet saldo demo ($100 USDT)** khusus untuk presentasi hackathon.

---

## 1. User Story & Core Value

> **Sebagai** seorang Clipper atau Juri Hackathon,  
> **Saya ingin** mencairkan saldo USDT hasil monetisasi video klip langsung ke e-wallet (DANA, GoPay, OVO, ShopeePay) atau rekening Bank (BCA, Mandiri, BRI, BNI) menggunakan antarmuka Poko yang otentik dan interaktif,  
> **Sehingga** saya dapat merasakan pengalaman *Web3-to-Fiat Cashout* yang mulus, cepat, dan transparan tanpa perlu membelanjakan uang riil atau KYC perbankan rumit selama sesi penjurian hackathon.

---

## 2. Arsitektur Komponen & Spesifikasi Desain

### A. Poko Design Language & Aesthetics
Mengadopsi standar visual resmi Poko App & Web3 Checkout widgets:
- **Primary Color:** `#0052FF` / Emerald `#10B981` / Poko Signature `#118eea` dengan aksen glassmorphic & subtle shadow.
- **Card Dual-Swap Structure:**
  1. **"Kamu Kirim" (You Send):** Input nominal USDT, badge token Tether opBNB, saldo tersedia, tombol `[MAX]`.
  2. **Interlock Divider:** Ikon swap melingkar dengan indikator kurs live: `1 USDT ≈ Rp 16.300`.
  3. **"Kamu Terima" (You Receive):** Output otomatis Rupiah (IDR), bendera Indonesia, estimasi waktu tiba `~10-30 detik (BI-FAST)`.
- **Payment Method Picker:**
  - Tab kategori: `[ 📱 E-Wallet ]` vs `[ 🏦 Transfer Bank ]`.
  - Brand badges: DANA (Biru), GoPay (Tosca), OVO (Ungu), ShopeePay (Oranye), BCA (Navy), Mandiri (Dark Blue), BRI (Royal Blue), BNI (Orange).
- **Hackathon Quick-Fill Presets:**
  - `[🧪 Test DANA: 0812-9876-5432]`
  - `[🧪 Test GoPay: 0857-1122-3344]`
  - `[🧪 Test BCA: 8870123456]`
- **Transparansi Fee:**
  - Bruto Rupiah (100%)
  - ClipStream Platform Protocol Fee (5.0%)
  - Poko Gateway Liquidity Fee (~1.2%)
  - Biaya Jaringan BI-FAST (Rp 0 / Disubsidi)
  - Net IDR Diterima Bersih

### B. Realistic 4-Stage Execution Pipeline
Saat tombol *"Konfirmasi & Tarik Saldo"* ditekan:
1. `[✓] Verifikasi EIP-712 Permit Signature & opBNB Escrow` (600ms)
2. `[✓] Lock & Burn USDT pada Poko Liquidity Contract` (700ms)
3. `[✓] Konversi FX USDT -> IDR via Automated Market Maker` (600ms)
4. `[✓] Penyaluran Dana ke Rail BI-FAST / DANA OpenAPI Settlement` (600ms)

### C. Struk Resmi Transaksi Poko
- Lencana centang hijau animasi (*pulsing checkmark*).
- Header: *"Pencairan Berhasil Disalurkan!"*
- Order ID Poko: `POKO-IDR-XXXXXX` (dengan tombol copy).
- Blockchain TxHash opBNB Testnet (tautan langsung ke block explorer).
- Reference Number BI-FAST & Timestamp WIB.
- Tombol: `[📱 Buka Simulasi Layar HP]` & `[Selesai / Kembali ke Dompet]`.

### D. The Pitch WOW Factor: Smartphone Push Notification & Phone Mockup
- **Floating Push Toast:** Muncul di kanan atas layar bergaya iOS/Android notification banner:
  > **🟢 DANA • Baru Saja**  
  > *Top-up Rp 154.850 dari PT Poko Finansial Indonesia (ClipStream AI Escrow) berhasil. Saldo DANA Anda bertambah!*
- **Interactive Smartphone Drawer / Modal:** Menampilkan mockup ponsel dengan layar aplikasi DANA / BCA yang memuat bukti transfer masuk resmi.

### E. Faucet Saldo Demo ($100 USDT)
- Di halaman dompet ([`apps/web/src/app/clipper/wallet/page.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/app/clipper/wallet/page.tsx)), terdapat banner kontrol sandbox dengan tombol:
  - `[+ Faucet $100 Demo USDT]` (menambah saldo secara instan dengan feedback toast).
  - `[↺ Reset Saldo Demo]`

---

## 3. Rencana Eksekusi (Implementation Waves)

### Wave 1: Re-skin & Poko Dual-Card Swap Component
- Perbarui [`apps/web/src/components/PokoOffRampModal.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/components/PokoOffRampModal.tsx) dengan struktur dual-card swap (You Send $\leftrightarrow$ You Receive).
- Tambahkan brand header "Powered by poko" dengan badge "🧪 SANDBOX / TESTNET".
- Tambahkan preset 1-klik akun tester (DANA, GoPay, BCA).
- Terapkan fee breakdown drawer yang rapi dan transparan.

### Wave 2: Realistic 4-Stage Execution Engine & Fallback
- Buat stepper interaktif animasi 4 tahap dengan status real-time teks.
- Pasang fallback otomatis: jika user offline/belum login, simulasi tetap berjalan mulus tanpa error 401.
- Buat struk detail dengan format nomor referensi BI-FAST dan opBNB block explorer.

### Wave 3: Virtual Smartphone Push Notification & Phone Simulator
- Buat komponen `MobilePushNotification.tsx` yang muncul di sudut layar saat penarikan sukses.
- Buat modal/drawer simulasi layar HP DANA/BCA (Mock Smartphone Screen).

### Wave 4: Faucet Saldo Demo di Halaman Dompet & Integrasi Penuh
- Pasang banner Sandbox di [`apps/web/src/app/clipper/wallet/page.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/app/clipper/wallet/page.tsx) dengan tombol Faucet $100 Demo.
- Hubungkan event penarikan agar saldo berkurang, mutasi masuk ke tabel histori, dan push notification terpicu.
- Verifikasi typecheck TypeScript (`tsc --noEmit`) dan jalankan test suite (`pnpm test`).

---

## 4. Kriteria Keberhasilan (Acceptance Criteria)

1. [ ] Tampilan modal Poko 100% menyerupai widget Web3 off-ramp produksi (dual-card swap, kurs live, provider selection).
2. [ ] Juri dapat mengklik preset akun (DANA/BCA) dengan 1 klik tanpa mengetik nomor manual.
3. [ ] Animasi 4 tahap pemrosesan berjalan mulus dan memperlihatkan detail teknis smart contract $\rightarrow$ BI-FAST.
4. [ ] Notifikasi virtual HP DANA/BCA muncul di layar browser setelah transaksi selesai.
5. [ ] Tombol Faucet $100 Demo di halaman dompet berfungsi menambah saldo instan.
6. [ ] Zero-error TypeScript compilation dan semua test suite lulus 100%.
