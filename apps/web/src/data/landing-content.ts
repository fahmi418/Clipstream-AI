/**
 * landing-content.ts
 * Single source of truth for landing page marketing copy, personas,
 * feature pillars, testimonials, and live ticker feeds.
 *
 * Cleaned, streamlined copywriting with zero repetitive phrasing.
 */

export interface PersonaItem {
  id: number;
  subtitle: string;
  tabLabel: string;
  color: string;
  bgActive: string;
  borderActive: string;
  textColor: string;
  badgeBg: string;
  heading: string;
  desc: string;
  cta: string;
  ctaHref: string;
  benefits: string[];
}

export interface FeatureSectionItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  description: string;
  bulletPoints: string[];
  graphicType: "verifier" | "tracker" | "escrow" | "analytics";
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  rating: number;
}

export interface TickerItem {
  id: string;
  color: string;
  text: string;
}

/* ── 1. Persona Profiles ────────────────────────────────────────── */
export const PERSONAS_DATA: PersonaItem[] = [
  {
    id: 1,
    subtitle: "Kreator Konten & Editor Video",
    tabLabel: "Clipper",
    color: "#e8400d",
    bgActive: "#fff8f5",
    borderActive: "#e8400d",
    textColor: "#c23306",
    badgeBg: "rgba(232, 64, 13, 0.1)",
    heading: "Bikin Klip Pendek Berkualitas, Payout Otomatis Masuk ke Dompet",
    desc: "Pilih kampanye aktif, potong momen terbaik, sematkan identitas sponsor, lalu publikasikan ke TikTok atau YouTube Shorts. Reward ditransfer langsung melalui smart contract begitu penayangan terverifikasi.",
    cta: "Mulai Jadi Clipper",
    ctaHref: "/clipper",
    benefits: [
      "Imbalan USDT instan berbasis penayangan valid di TikTok dan Shorts",
      "Verifikasi otomatis audio Whisper dan visual watermark via AI Agent",
      "Tanpa potongan biaya tersembunyi dan tanpa proses persetujuan manual",
    ],
  },
  {
    id: 2,
    subtitle: "Brand, Perusahaan & Pengiklan",
    tabLabel: "Brand",
    color: "#2563eb",
    bgActive: "#eff6ff",
    borderActive: "#2563eb",
    textColor: "#1d4ed8",
    badgeBg: "rgba(37, 99, 235, 0.1)",
    heading: "Jangkau Jutaan Penonton Organik dengan Jaminan Proteksi Anggaran",
    desc: "Kunci anggaran kampanye dalam escrow smart contract BNB Chain. Pembayaran hanya dilepas untuk penayangan otentik yang telah divalidasi oleh sistem cerdas multimodal kami.",
    cta: "Pasang Kampanye Brand",
    ctaHref: "/brand/new",
    benefits: [
      "Alokasi dana terlindungi dalam timelock smart contract terverifikasi",
      "Deteksi manipulasi penayangan dan proteksi anti-sybil teruji",
      "Efisiensi belanja promosi hingga 70% dibanding kanal iklan konvensional",
    ],
  },
  {
    id: 3,
    subtitle: "Agency Talent & Manajemen Kreator",
    tabLabel: "Agency",
    color: "#059669",
    bgActive: "#f0fdf4",
    borderActive: "#059669",
    textColor: "#047857",
    badgeBg: "rgba(5, 150, 105, 0.1)",
    heading: "Kelola Puluhan Talenta Kreator dalam Satu Panel Terpusat",
    desc: "Otomatisasi pembagian royalti antara agensi dan talenta secara transparan tanpa perlu rekapitulasi invoice atau rekonsiliasi manual di akhir bulan.",
    cta: "Eksplorasi Solusi Agensi",
    ctaHref: "/campaigns",
    benefits: [
      "Distribusi bagi hasil komisi otomatis langsung ke alamat dompet kreator",
      "Pantauan performa penayangan dan retensi klip secara langsung",
      "Manajemen multi-kampanye terpadu untuk efisiensi operasional tim",
    ],
  },
  {
    id: 4,
    subtitle: "Validator Komunitas & Reviewer Node",
    tabLabel: "Validator",
    color: "#d97706",
    bgActive: "#fffbeb",
    borderActive: "#d97706",
    textColor: "#b45309",
    badgeBg: "rgba(217, 119, 6, 0.1)",
    heading: "Jaga Integritas Ekosistem dan Dapatkan Imbal Hasil Protokol",
    desc: "Bantu jaringan meninjau video yang memerlukan penilaian sekunder saat terjadi sengketa, lalu peroleh bagi hasil imbalan dari tata kelola protokol.",
    cta: "Pelajari Reviewer Node",
    ctaHref: "/admin",
    benefits: [
      "Resolusi sengketa independen untuk menjamin keadilan kreator dan brand",
      "Imbalan staking validator on-chain yang terdistribusi transparan",
      "Memastikan kualitas ekosistem video Web3 bebas dari kecurangan",
    ],
  },
  {
    id: 5,
    subtitle: "Web3 Protocols, dApps & DAO Ecosystem",
    tabLabel: "Ekosistem Web3",
    color: "#7c3aed",
    bgActive: "#f5f3ff",
    borderActive: "#7c3aed",
    textColor: "#6d28d9",
    badgeBg: "rgba(124, 58, 237, 0.1)",
    heading: "Integrasikan Escrow Smart Contract ke Platform Anda",
    desc: "Gunakan infrastruktur escrow terverifikasi kami untuk menggerakkan kampanye video komunitas di BNB Chain dengan audit terbuka di blockchain.",
    cta: "Lihat Repositori & Kontrak",
    ctaHref: "https://testnet.bscscan.com",
    benefits: [
      "Smart contract escrow BNB Chain non-kustodian yang siap diintegrasikan",
      "Webhook dan REST API untuk sinkronisasi bounty ke dApp eksternal",
      "Audit keamanan terstandarisasi berbasis arsitektur kontrak teruji",
    ],
  },
];

/* ── 2. Feature Pillars ─────────────────────────────────────────── */
export const FEATURE_SECTIONS: FeatureSectionItem[] = [
  {
    id: "ai-verifier",
    badge: "AI Multimodal Verifier",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    title: "Validasi Konten Otomatis dengan Deteksi Audio dan Visual",
    description:
      "Kombinasi transkripsi audio Whisper dan analisis visual Gemini mendeteksi watermark sponsor serta kesesuaian pesan video secara presisi dalam hitungan detik.",
    bulletPoints: [
      "Pencocokan transkrip ucapan dan kata kunci promosi secara otomatis",
      "Pendeteksian posisi serta durasi watermark sponsor sepanjang video",
      "Persetujuan instan tanpa ketergantungan pada verifikasi manual",
    ],
    graphicType: "verifier",
  },
  {
    id: "view-tracker",
    badge: "Anti-Sybil View Tracker",
    badgeColor: "#d97706",
    badgeBg: "#fffbeb",
    title: "Pelacakan Penayangan Organik dengan Perlindungan Manipulasi",
    description:
      "Integrasi resmi ke platform video global mengukur impresi asli dan menyaring penayangan palsu secara ketat demi akurasi metrik sponsor.",
    bulletPoints: [
      "Sinkronisasi berkala melalui API resmi platform video",
      "Deduplikasi penayangan antar-jaringan untuk mencegah penghitungan ganda",
      "Laporan analitik retensi penonton dan rasio interaksi yang akurat",
    ],
    graphicType: "tracker",
  },
  {
    id: "escrow-vault",
    badge: "Non-Custodial Escrow",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    title: "Jaminan Pembayaran Aman dengan Smart Contract Timelock",
    description:
      "Anggaran sponsor dikunci di blockchain sejak awal kampanye. Kreator memiliki kepastian penuh bahwa hak mereka akan cair tepat waktu sesuai pencapaian.",
    bulletPoints: [
      "Kontrak timelock escrow non-kustodian di jaringan BNB Chain",
      "Pencairan otomatis langsung ke alamat dompet digital kreator",
      "Jadwal holdback teratur untuk menjaga retensi konten tetap aktif",
    ],
    graphicType: "escrow",
  },
  {
    id: "cpm-analytics",
    badge: "Ekonomi Transparan",
    badgeColor: "#2563eb",
    badgeBg: "#eff6ff",
    title: "Kalkulasi CPM Terbuka dengan Potensi Pendapatan Maksimal",
    description:
      "Skema imbalan transparan dengan nilai CPM kompetitif antara Rp 15.000 hingga Rp 35.000 per 1.000 penayangan yang dapat diaudit publik.",
    bulletPoints: [
      "Kalkulator proyeksi estimasi hasil sebelum kreator mulai menyunting",
      "Pengukuran kualitas audiens lokal berdaya beli nyata",
      "Laporan efektivitas anggaran sponsor tanpa biaya tak terduga",
    ],
    graphicType: "analytics",
  },
];

/* ── 3. Testimonial Reviews ─────────────────────────────────────── */
export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "testi-1",
    author: "Budi Santoso",
    role: "Kreator TikTok • 850k Views",
    tag: "Verified Clipper",
    tagColor: "#059669",
    tagBg: "rgba(5, 150, 105, 0.12)",
    rating: 5,
    quote:
      "Dulu sering khawatir brand mangkir setelah video FYP. Di ClipStream AI, dananya sudah terkunci di smart contract sejak awal. Begitu target penayangan tercapai, saldo langsung cair ke dompet.",
  },
  {
    id: "testi-2",
    author: "Rian Pratama",
    role: "Content Creator • YouTube Shorts",
    tag: "Verified Clipper",
    tagColor: "#059669",
    tagBg: "rgba(5, 150, 105, 0.12)",
    rating: 5,
    quote:
      "Proses validasinya berjalan cepat dan mandiri. Cukup cantumkan tautan Shorts, sistem langsung memeriksa secara otomatis dan hasil imbalan bisa ditarik tanpa proses birokrasi berbelit.",
  },
  {
    id: "testi-3",
    author: "Jessica Hartono",
    role: "Marketing Lead, Brand D2C",
    tag: "Verified Brand",
    tagColor: "#0284c7",
    tagBg: "rgba(2, 132, 199, 0.12)",
    rating: 5,
    quote:
      "Kami menyiapkan bounty untuk peluncuran lini produk baru dan memperoleh puluhan konten video kreatif dalam satu minggu. Hasil impresi organik jauh lebih efisien dibanding beriklan mandiri.",
  },
];

/* ── 4. Live Activity Ticker Feed ───────────────────────────────── */
export const TICKER_UPDATES: TickerItem[] = [
  { id: "tick-1", color: "#10b981", text: "Smart contract timelock BNB Chain beroperasi dengan 0 insiden keamanan" },
  { id: "tick-2", color: "#e8400d", text: "Kreator mencairkan saldo USDT instan ke rekening e-wallet lokal" },
  { id: "tick-3", color: "#0284c7", text: "Brand teknologi meluncurkan program promosi video baru di platform" },
  { id: "tick-4", color: "#f59e0b", text: "Model Gemini Vision memperbarui akurasi pengenalan logo sponsor" },
  { id: "tick-5", color: "#8b5cf6", text: "Rata-rata penyelesaian validasi sistem tercatat di bawah 15 detik" },
  { id: "tick-6", color: "#059669", text: "Komunitas kreator aktif membukukan pertumbuhan impresi positif" },
  { id: "tick-7", color: "#3b82f6", text: "Verifikasi proof-of-engagement berlangsung transparan di blockchain" },
];
