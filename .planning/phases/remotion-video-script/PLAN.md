# Phase Plan: Remotion Video Script, Storyboard & Motion Graphic Direction (No-VO)

**Objective:**
Menyusun script video dan storyboard arahan gerak (*creative motion direction*) berskala produksi dalam format `.md` untuk video demo produk ClipStream AI berdurasi sekitar 1 menit 30 detik (90 detik / 2.700 frame @ 30fps). Mengadopsi gaya visual **Google "Canvas in Gemini" Launch Video** (`video_demo/Google Reference Video.mp4`): tanpa voiceover (NO VO), berbasis *kinetic typography*, *beat-driven*, percussive micro-interactions, 3D perspective camera tilts, floating UI cards, dan sinkronisasi ritme ceria untuk diimplementasikan menggunakan **Remotion framework** (video-as-code).

---

## 1. Konsep & Analisis Gaya Referensi (Google Video Breakdown)

Mengacu pada `video_demo/Google Reference Video.mp4`:
1. **No Voiceover (Zero VO):** Pesan disampaikan 100% secara visual melalui teks kinetik yang ritmis, tipografi kontras (putih dengan aksen warna/gradien), dan UI interaktif langsung.
2. **Tempo & Rhythm:** Beat musik ceria/upbeat (sekitar 115-125 BPM) dengan *drum chops*, *vocal chops*, dan *percussive SFX* (click, pop, whoosh, keystroke, slide, ding, cash register chime). Setiap transisi dan elemen muncul tepat pada ketukan (*on-beat*).
3. **Micro-Interactions & UI Staging:**
   - Pill badge menyala (*glow aura*).
   - Input bar dengan *typing cursor* animasi.
   - Jendela aplikasi / card dengan sudut perspektif 3D (*isometric depth*).
   - Animasi toggle/slider yang bergerak mulus dengan *spring physics* (damping & stiffness).
   - Kartu-kartu hasil (*data, preview, metrics*) meletup (*pop-in with scale & rotation bounce*).
4. **Alur Cerita ClipStream (Arc 90 Detik):**
   - **Act I: The Hook & Pain Point (00:00 - 00:15)** — Masalah verifikasi manual & ketidakpercayaan brand/clipper.
   - **Act II: The Protocol Introduction (00:15 - 00:30)** — Memperkenalkan ClipStream AI Copilot & Smart Contract Escrow di opBNB.
   - **Act III: Multi-Modal AI Verification (00:30 - 00:55)** — Live audit: Whisper Audio Match + Gemini Vision OCR + API Oracle.
   - **Act IV: The Settlement & Off-Ramp (00:55 - 01:15)** — Pembagian 70% Instant Payout (Poko BI-FAST / DANA) + 30% Timelock Holdback 72 Jam.
   - **Act V: Trustless Scale & Outro CTA (01:15 - 01:30)** — BscScan on-chain proof, multi-platform compatibility, brand logo outro & URL.

---

## 2. Struktur Remotion Video Architecture

Video akan dirancang agar dapat diimplementasikan sebagai komponen React dalam Remotion:
- **Ukuran Layar:** 1920 × 1080 (16:9 Landscape) & modular untuk 1080 × 1920 (9:16 Shorts/Reels).
- **FPS:** 30 fps (Total durasi 90 detik = 2.700 frame).
- **Struktur Sequence Remotion:**
  ```tsx
  <Composition id="ClipstreamProductDemo" durationInFrames={2700} fps={30} width={1920} height={1080} />
  ```
  - `Sequence 1: HookIntro` (Frame 0 - 450 / 0s - 15s)
  - `Sequence 2: ProtocolReveal` (Frame 450 - 900 / 15s - 30s)
  - `Sequence 3: AIVerificationEngine` (Frame 900 - 1650 / 30s - 55s)
  - `Sequence 4: EscrowAndPokoCashout` (Frame 1650 - 2250 / 55s - 75s)
  - `Sequence 5: TrustlessOutroCTA` (Frame 2250 - 2700 / 75s - 90s)

---

## 3. Rincian Task Eksekusi Phase 1

- [x] **Task 1.1:** Analisis detail video referensi Google (`Google Reference Video.mp4`) untuk mengekstrak pola tipografi, durasi per kata, animasi spring, dan penataan UI.
- [x] **Task 1.2:** Pemetaan fitur & komponen nyata ClipStream dari codebase:
  - `ClipstreamHeroProductScreen.tsx` (Dashboard Copilot, daftar klip, inspector panel).
  - Poko Sandbox Off-Ramp (Dual-card swap USDT -> IDR, notifikasi push HP DANA/BCA).
  - 3 Signal Cards (Whisper Audio Match, Gemini Vision + API Oracle, Smart Contract Timelock).
- [x] **Task 1.3:** Pembuatan dokumen master `video_demo/SCRIPT_AND_STORYBOARD.md` yang memuat:
  - Timeline frame-by-frame (detik & frame).
  - Kinetic typography text (kata-kata di layar dengan styling font & warna).
  - Visual description (layout visual, posisi kamera, depth of field, glow).
  - UI Component staging (elemen UI mana dari project yang muncul).
  - Sound design & beat cue (efek suara percussive & sinkronisasi musik).
  - Remotion code directives (fungsi interpolasi, spring config, CSS transform 3D).
- [x] **Task 1.4:** Verifikasi alignment terhadap Phase 2 (katalog aset SVG yang dibutuhkan) dan Phase 3 (timing marker musik & sound effects).

---

## 4. Kriteria Keberhasilan (Verification Criteria)
1. Dokumen `video_demo/SCRIPT_AND_STORYBOARD.md` tersedia lengkap dengan total durasi 90 detik (2.700 frame).
2. Setiap scene memiliki timecode presisi, teks kinetik di layar, deskripsi animasi UI, dan padanan SFX.
3. Gaya visual selaras dengan referensi Google (tanpa VO, mengandalkan teks dinamis dan UI modern).
4. Mencakup seluruh alur produk ClipStream: brand lock budget, submission klip, Whisper AI, Gemini Vision, Oracle views, split escrow 70/30, dan pencairan Poko BI-FAST/DANA.
