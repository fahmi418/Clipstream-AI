# Phase Plan: UI Text De-duplication, Copy Streamlining & Visual SVG Design System Refactor

**Objective:**
Menghilangkan seluruh duplikasi teks dan array data di frontend, merapikan narasi/copywriting agar lebih padat dan berdampak tinggi, serta menyusun **sistem visual SVG yang cantik, konsisten, dan rapi** (menggantikan ikon tanpa kontainer dengan *Icon Badges*, palet harmonis, dan mockup vektor berkualitas tinggi).

---

## 1. Analisis Masalah Saat Ini

### A. Pengulangan Teks & Data Redundancy
1. **Duplikasi Array Persona di `page.tsx`:**  
   Objek 5 persona (`Kreator Konten`, `Brand`, `Agency Talent`, `Validator Komunitas`, `Web3 Protocols`) dideklarasikan secara manual **dua kali berturut-turut** di dalam file yang sama (baris ~1790 dan ~1945), menyebabkan ratusan baris kode identik berulang.
2. **Duplikasi List Benefit & Ticker:**  
   Poin-poin benefit seperti *"0% potongan platform fee"*, *"Whisper Audio"*, dan *"Smart contract timelock"* berulang di berbagai section tanpa ada pembeda nilai yang unik.
3. **Duplikasi Provider Keuangan:**  
   Definisi `EWALLET_PROVIDERS` dan `BANK_PROVIDERS` tercatat berulang kali di `ClipperWalletModal.tsx`, `PokoOffRampModal.tsx`, dan `wallet/page.tsx`.
4. **Copywriting yang Terlalu Bertele-tele:**  
   Banyak teks promosi panjang yang mengulang konsep dasar secara redundan, membuat pembaca cepat bosan. Perlu dipadatkan menjadi narasi yang *punchy*, profesional, dan fokus pada keuntungan pengguna.

### B. Visual & SVG yang Kurang Rapi
1. **Ikon "Gantung" Tanpa Kontainer:**  
   Ikon SVG sering diselipkan langsung di sebelah teks tanpa kontainer visual (misalnya ukuran acak `11px`, `12px`, `14px`, `17px`), sehingga tampak seperti stiker terpisah dan kurang terstruktur.
2. **Ketiadaan Sistem Icon Badge Terstandar:**  
   Perlu dibuat komponen visual micro (*Icon Badge / Visual Pill*) dengan kontainer halus, latar warna bergradien lembut sesuai tema (`#e8400d/10`, `#10b981/10`, `#2563eb/10`), dan border subtle.
3. **Mockup Vektor Monolitik:**  
   4 diagram ilustrasi SVG di `page.tsx` masih berbentuk hardcoded string raksasa yang kaku. Perlu ditata agar memiliki hierarki visual modern setara produk SaaS global (Linear / Raycast / Stripe).

---

## 2. Rencana Implementasi Bertahap (Execution Waves)

### Wave 1: Ekstraksi Data Tunggal (Single Source of Truth) & Perapian Copywriting
- Buat file konstanta bersama: [`apps/web/src/data/landing-content.ts`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/data/landing-content.ts) yang memuat:
  - `PERSONAS_DATA`: 5 persona terstruktur tanpa duplikasi dengan benefit yang tajam.
  - `FEATURE_SECTIONS`: 4 pilar fitur inti (AI Audio/Visual Whisper, Anti-Sybil View Tracker, Timelock Escrow, CPM Transparency).
  - `TESTIMONIALS_DATA`: Ulasan verified clipper dan brand.
  - `TICKER_UPDATES`: Live activity ticker feed.
- Buat file konstanta keuangan bersama: [`apps/web/src/data/payment-providers.ts`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/data/payment-providers.ts) untuk `EWALLET_PROVIDERS` dan `BANK_PROVIDERS`.
- Pangkas narasi berulang pada landing page agar setiap section memiliki pesan spesifik yang tidak tumpang-tindih.

### Wave 2: Visual Icon Design System & Micro-Visual Component
- Bangun komponen visual terpadu: [`apps/web/src/components/ui/IconBadge.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/components/ui/IconBadge.tsx):
  - Variasi ukuran standar: `sm` (28px box, 14px icon), `md` (36px box, 18px icon), `lg` (48px box, 24px icon).
  - Varian warna tema: `brand` (oranye), `emerald` (hijau sukses), `blue` (web3/info), `amber` (peringatan/emas), `purple` (escrow/AI).
  - Styling: Soft background tint (10-15% opacity), subtle border (`rgba(..., 0.12)`), smooth rounded-xl corners.
- Terapkan `IconBadge` pada:
  - Header navigasi drawer ([`Nav.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/components/Nav.tsx)).
  - Section Persona & Role Switcher.
  - Kartu Metrik di Admin, Brand, dan Clipper Dashboard.
  - Modal FAQ & Petunjuk dompet.

### Wave 3: Refactoring Modularitas Halaman Utama (`page.tsx`)
- Ganti duplikasi loop persona dengan komponen tab tunggal yang dinamis.
- Render kartu testimonial dan fitur secara otomatis berbasis map dari `landing-content.ts`.
- Bersihkan ratusan baris inline SVG raksasa menjadi modular visual card yang rapi dan responsif di mobile.
- Pastikan ukuran file `page.tsx` terpangkas secara signifikan (~2.700 baris menjadi <1.200 baris yang bersih dan modular).

### Wave 4: Sinkronisasi Modal Keuangan & Provider Terpadu
- Impor `EWALLET_PROVIDERS` dan `BANK_PROVIDERS` dari `payment-providers.ts` ke dalam:
  - [`apps/web/src/components/ClipperWalletModal.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/components/ClipperWalletModal.tsx)
  - [`apps/web/src/components/PokoOffRampModal.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/components/PokoOffRampModal.tsx)
  - [`apps/web/src/app/clipper/wallet/page.tsx`](file:///d:/Ethermind_Agency/Clipstream-AI/apps/web/src/app/clipper/wallet/page.tsx)
- Pastikan ikon e-wallet dan bank memiliki kontainer visual yang rapi dan proporsional.

### Wave 5: Verifikasi, Zero-Regression & Visual Inspection
- Jalankan pemeriksaan tipe TypeScript menyeluruh: `npx tsc --noEmit`.
- Pastikan tidak ada duplikasi teks yang tersisa.
- Pastikan tampilan visual di desktop & mobile terlihat sangat rapi, mewah, dan profesional tanpa bug visual.

---

## 3. Kriteria Keberhasilan (Acceptance Criteria)

1. [x] Tidak ada array atau blok data teks yang terduplikasi di `page.tsx` maupun antar-komponen.
2. [x] File `page.tsx` menjadi jauh lebih ringkas, modular, dan mudah dipelihara.
3. [x] Semua ikon SVG tampil dalam tatanan visual yang terstruktur (menggunakan `IconBadge` / kontainer proporsional), bukan ikon telanjang tanpa alignment.
4. [x] Copywriting pada landing page padat, profesional, dan to-the-point tanpa repetisi kata yang monoton serta bebas dari pemisah dash (`-`) yang canggung.
5. [x] Provider e-wallet dan bank tersentralisasi pada satu data source (`payment-providers.ts`).
6. [x] Zero-error TypeScript compilation (`tsc --noEmit`).
7. [x] Dev server berjalan mulus pada `http://localhost:3000` dan seluruh test suite lulus (28 API tests, 5 Contracts SDK tests, 18 Agent tests).
