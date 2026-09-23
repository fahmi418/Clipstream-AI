// Shared blog article data — used by public /blog, /blog/[slug], and /admin/blog pages

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  coverImage: string;
  excerpt: string;
  content: string; // HTML string
  author: string;
  readTime: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "1",
    slug: "panduan-memulai-clipper-bnb-chain",
    title: "Panduan Lengkap Memulai Menjadi Clipper Video Berbayar di BNB Chain",
    category: "Panduan",
    date: "23 Sep 2026",
    coverImage: "/assets/blog-cover-clipper.jpg",
    excerpt:
      "Pelajari cara memotong video, mengunggah ke YouTube Shorts atau TikTok dengan watermark sponsor, dan menerima pembayaran USDT otomatis langsung dari smart contract.",
    readTime: "6 menit",
    author: "Tim ClipStream AI",
    content: `
<p>Menjadi video clipper berbayar di era Web3 lebih mudah dari yang kamu bayangkan. Platform seperti ClipStream AI menghubungkan kamu langsung dengan brand yang butuh distribusi video — tanpa perantara, tanpa invoice manual.</p>

<h2>Apa Itu Video Clipper?</h2>
<p>Video clipper adalah kreator yang memotong konten panjang (podcast, webinar, livestream) menjadi klip pendek berdurasi 30–90 detik, lalu mengunggahnya ke TikTok, YouTube Shorts, atau Instagram Reels dengan watermark sponsor brand.</p>

<h2>Cara Kerja Sistem Pembayaran</h2>
<p>Brand mengunci budget di <strong>smart contract BNB Chain</strong>. Setiap kali klip kamu melewati ambang views yang ditentukan, sistem AI (Whisper + Gemini Vision) memverifikasi:</p>
<ul>
  <li>Apakah klip berasal dari video sumber yang benar</li>
  <li>Apakah watermark sponsor terdeteksi</li>
  <li>Apakah konten sesuai aturan brand safety</li>
</ul>
<p>Jika semua terpenuhi, USDT langsung ditransfer ke wallet kamu — tanpa perlu chat admin atau kirim invoice.</p>

<h2>Langkah 1: Daftar sebagai Clipper</h2>
<p>Kunjungi halaman <strong>Mulai Gratis</strong> di ClipStream AI, pilih peran "Clipper", dan hubungkan wallet BNB Chain kamu (MetaMask atau Trust Wallet).</p>

<h2>Langkah 2: Pilih Campaign</h2>
<p>Buka halaman Marketplace dan pilih campaign yang aktif. Perhatikan tarif CPM (Cost per 1.000 views) dan aturan brand safety sebelum mulai.</p>

<h2>Langkah 3: Buat Klip & Submit</h2>
<p>Potong video sumber menggunakan CapCut, DaVinci Resolve, atau tools lain. Tambahkan watermark sponsor sesuai panduan brand. Upload ke platform pilihanmu, lalu paste URL ke halaman Submit Klip di ClipStream AI.</p>

<h2>Langkah 4: Pantau & Cair</h2>
<p>AI akan mulai memantau views klip kamu setiap beberapa jam. Begitu target views tercapai, payout USDT otomatis terkirim. Kamu bisa cek riwayat pencairan di Dashboard Clipper.</p>

<p>Selamat mencoba — dan semoga views kamu segera tembus!</p>
    `.trim(),
  },
  {
    id: "2",
    slug: "timelock-escrow-pembayaran-tanpa-admin",
    title: "Bagaimana Timelock Escrow Menjamin Pembayaran Tanpa Biaya Admin",
    category: "Smart Contract",
    date: "21 Sep 2026",
    coverImage: "/assets/blog-cover-escrow.jpg",
    excerpt:
      "Timelock escrow memastikan dana brand terkunci aman di blockchain sampai syarat views terpenuhi — tanpa risiko kabur, tanpa potongan platform.",
    readTime: "5 menit",
    author: "Tim ClipStream AI",
    content: `
<p>Salah satu masalah terbesar di industri pemasaran video adalah ketidakpastian pembayaran. Brand sering menunda transfer setelah klip viral, sementara clipper tak punya daya tawar. Timelock escrow hadir sebagai solusi permanen berbasis kode.</p>

<h2>Apa Itu Timelock Escrow?</h2>
<p>Timelock escrow adalah mekanisme smart contract yang mengunci sejumlah dana hingga kondisi tertentu terpenuhi dalam batas waktu yang ditetapkan. Di ClipStream AI, kondisi tersebut adalah: <em>klip mencapai jumlah views minimum yang telah disepakati</em>.</p>

<h2>Keunggulan vs Sistem Manual</h2>
<ul>
  <li><strong>Tidak bisa dibatalkan sepihak:</strong> Brand tidak bisa menarik dana selama campaign aktif dan clipper sudah bergabung.</li>
  <li><strong>Tidak ada potongan tersembunyi:</strong> Angka payout yang tertera di smart contract adalah yang diterima — minus gas fee minimal.</li>
  <li><strong>Transparan & verifikabel:</strong> Siapapun bisa melihat saldo escrow di BscScan.</li>
</ul>

<h2>Alur Teknis Singkat</h2>
<p>Brand deposit USDT → Smart contract lock dengan parameter CPM, cap per klip, dan deadline → Clipper submit URL → AI verifikasi views → Payout otomatis trigger dari kontrak.</p>

<h2>Bagaimana Jika Views Tidak Tercapai?</h2>
<p>Jika campaign berakhir dan ada sisa dana yang tidak terdistribusi, brand bisa menarik kembali sisa tersebut 3 hari setelah deadline — sesuai aturan yang dikunci saat awal campaign dibuat.</p>

<p>Dengan timelock escrow, kepercayaan tidak lagi dibutuhkan karena kode yang menjamin segalanya.</p>
    `.trim(),
  },
  {
    id: "3",
    slug: "whisper-ai-gemini-vision-validasi-watermark",
    title: "Cara Whisper AI & Gemini Vision Memvalidasi Watermark Sponsor dan Konten Klip",
    category: "AI Verifier",
    date: "18 Sep 2026",
    coverImage: "/assets/blog-cover-ai.jpg",
    excerpt:
      "Pipeline AI ClipStream menggunakan Whisper untuk analisis audio dan Gemini Vision Flash untuk pengecekan visual watermark — semua otomatis tanpa reviewer manusia.",
    readTime: "7 menit",
    author: "Tim ClipStream AI",
    content: `
<p>Di balik pencairan USDT otomatis ClipStream AI terdapat pipeline verifikasi dua lapis yang memastikan setiap klaim pembayaran adalah sah dan sesuai aturan brand.</p>

<h2>Lapisan 1: Whisper Audio Analysis</h2>
<p>OpenAI Whisper mentranskripsi audio klip yang disubmit. Hasilnya dibandingkan dengan transkrip video sumber yang sudah diindeks saat brand membuat campaign. Sistem menghitung <em>similaritas semantik</em> untuk memastikan klip benar-benar berasal dari konten yang sama.</p>

<h2>Lapisan 2: Gemini Vision Flash OCR</h2>
<p>Setelah verifikasi audio, Gemini Vision Flash memindai frame-frame kunci klip untuk mendeteksi:</p>
<ul>
  <li>Keberadaan watermark visual sponsor (logo, teks overlay)</li>
  <li>Kesesuaian konten dengan aturan brand safety yang dikunci di kontrak</li>
  <li>Apakah klip merupakan duplikasi dari submission lain di sistem</li>
</ul>

<h2>Skor Konfiden & Ambang Batas</h2>
<p>Setiap klip mendapat skor konfiden 0–1. Klip dengan skor di atas 0.80 otomatis disetujui. Klip dengan skor 0.60–0.79 masuk antrian review manual di portal admin. Di bawah 0.60 ditolak otomatis.</p>

<h2>Mengapa Tidak Bisa Dimanipulasi?</h2>
<p>Sistem kami tidak mengandalkan metadata yang bisa dipalsukan. Analisis dilakukan langsung pada konten audio-visual mentah dari URL yang disubmit — bukan dari data yang diklaim clipper. Ini membuat pemalsuan views atau watermark sangat sulit dilakukan.</p>

<p>Hasilnya? Clipper yang jujur dapat dibayar cepat, dan brand mendapat jaminan klip yang benar-benar sesuai standar mereka.</p>
    `.trim(),
  },
];
