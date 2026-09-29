# Phase Plan: Remotion Audio Sync, SFX Engineering & Motion Graphics Video Generation

**Objective:**
Menyelesaikan Phase 3 dari Milestone 3: membangun sistem audio-visual tersinkronisasi penuh (BGM ceria 120 BPM, 32 SFX percussive cues, dan visual motion graphic kinetik) menggunakan framework Remotion berbasis kode React/TypeScript, tanpa voiceover (Zero VO), mengadopsi standar kualitas visual Google Reference Video.

---

## 1. Komponen & Deliverables Phase 3

### A. Sound Design & Audio Engineering
- **Percussive SFX Library (10 Custom Assets @ 16-bit 44.1kHz WAV):**
  - `sfx_click.wav` — Click tactile mechanical keyboard
  - `sfx_pop.wav` — Pop bubble lembut untuk teks kinetik & badge
  - `sfx_whoosh.wav` — Whoosh transisi kamera & pergeseran objek
  - `sfx_ding.wav` — Chime bell kristal verifikasi AI Whisper 98.8%
  - `sfx_notification.wav` — Melodic 2-tone chime push notification DANA
  - `sfx_stamp.wav` — Dentuman bass berat + slap stempel heksagonal 3D
  - `sfx_coin.wav` — Dual-tone koin berdering untuk split escrow 70/30
  - `sfx_scan.wav` — Sci-Fi frequency sweep pemindai laser Gemini Vision
  - `sfx_typing.wav` — Keystroke tap cepat saat input URL Shorts
  - `sfx_chord.wav` — Lush major synth chord untuk outro reveal ClipStream AI
- **Upbeat Rhythm Guide Track (90s / 120 BPM):**
  - `cheerful_beat_guide.wav` — 180 beats, 45 bars, 4/4 meter, disintesis presisi 30 FPS.
- **Audio Synchronization Cue Sheet (`video_demo/AUDIO_SYNC_TIMING.md`):**
  - 32 titik pemicu frame-akurat (Frame 0 s/d 2700).

### B. Remotion Architecture & Code Structure (`video_demo/remotion/`)
- `Root.tsx`:
  - `ClipstreamProductDemo`: Komposisi 1920x1080 Landscape (1:30 = 2700 frames @ 30 FPS).
  - `ClipstreamVerticalShorts`: Komposisi 1080x1920 Vertical (1:30 = 2700 frames @ 30 FPS).
- `ClipstreamDemoVideo.tsx`: Master timeline, BGM player, `AudioSFXManager`, dan `AmbientGlow`.
- **Reusable Micro-Components:**
  - `KineticText.tsx`: Animasi kata per kata dengan highlight dinamis (warna oranye flame, emas BNB, tosca, biru).
  - `AmbientGlow.tsx`: Radial dynamic aura background yang berdenyut mengikuti ketukan musik.
  - `AudioSFXManager.tsx`: Pemutar audio SFX multi-track frame-accurate.
- **5 Sequence Segment Components (`src/sequences/`):**
  - `Seq1_HookProblem.tsx`: Frame 0 - 450 (The Clipper Dilemma & Manual Delay).
  - `Seq2_ProtocolReveal.tsx`: Frame 450 - 900 (The Glowing Copilot Pill & 3D Window Viewport).
  - `Seq3_AIVerifier.tsx`: Frame 900 - 1650 (Whisper Audio AI, Gemini Vision Laser, Oracle Cards, 3D Hexagonal Stamp).
  - `Seq4_EscrowCashout.tsx`: Frame 1650 - 2250 (70/30 Escrow Split, Poko Instant Swap, Smartphone DANA Chime).
  - `Seq5_TrustlessOutro.tsx`: Frame 2250 - 2700 (opBNB BscScan Proof, 3-Beats Manifesto, Phoenix Logo & Outro CTA).

---

## 2. Kriteria Verifikasi (Quality Assurance)
1. **Zero VO Compliance:** 100% informasi tersampaikan lewat teks kinetik dan visual UI.
2. **Audio-Visual Precision:** Setiap SFX meletup tepat pada frame ketukan (1 Beat = 15 frame @ 30 FPS).
3. **Type Safety & Build:** `npx tsc --noEmit` bersih tanpa error.
4. **Visual Rendering Audit:** Render still frame preview dari setiap sequence (Frames 100, 460, 780, 1050, 1260, 1600, 2130, 2600) untuk memvalidasi tipografi, kontras warna, hierarki visual, dan tidak adanya tumpang tindih elemen.
5. **Production Readiness:** Mendukung preview interaktif via Remotion Player (`pnpm dev`) dan render final MP4 (`pnpm build`).
