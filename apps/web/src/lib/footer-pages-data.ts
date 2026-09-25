export interface InfoPage {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  badge?: string;
  highlights: { title: string; desc: string; iconName?: string }[];
  contentHtml: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export const PRODUCT_PAGES: Record<string, InfoPage> = {
  "ai-verifier": {
    slug: "ai-verifier",
    category: "Product / Intelligence & AI",
    title: "AI Verifier Copilot",
    subtitle: "Sistem orkestrasi AI multi-modal otonom yang memverifikasi kepatuhan sponsor, audio watermark, dan views valid secara real-time.",
    badge: "Multi-Modal AI Pipeline",
    highlights: [
      { title: "Whisper Audio Matching", desc: "Transkripsi otomatis 99.4% akurat untuk mendeteksi sebutan nama brand, tagar, dan call-to-action sponsor." },
      { title: "Gemini Vision OCR", desc: "Mendeteksi penempatan logo, visual watermark, dan layout klip video tanpa lag." },
      { title: "Proof-of-View Attestation", desc: "Menghasilkan tanda tangan kriptografis untuk memicu pencairan smart contract escrow seketika." },
    ],
    contentHtml: `
      <h2>Bagaimana AI Verifier Bekerja?</h2>
      <p>AI Verifier Copilot bertindak sebagai jembatan antara konten video kreator di platform Web2 (YouTube Shorts, TikTok, Instagram Reels) dengan Smart Contract escrow di BNB Chain.</p>
      
      <h2>Langkah Verifikasi Otomatis:</h2>
      <ul>
        <li><strong>1. Ingestion:</strong> Clipper memasukkan URL video klip yang sudah dipublikasikan.</li>
        <li><strong>2. Multi-Modal Analysis:</strong> Whisper membedah rekaman audio dan Gemini Vision menganalisis frame video untuk memverifikasi watermark brand.</li>
        <li><strong>3. Anti-Cheat Check:</strong> Memeriksa keunikan video hash terhadap database klip sebelumnya untuk mencegah klaim ganda.</li>
        <li><strong>4. On-Chain Payout:</strong> Mengirimkan sinyal verifikasi ke smart contract untuk mentransfer USDT langsung ke wallet clipper.</li>
      </ul>

      <h2>Keunggulan Utama</h2>
      <p>Tidak ada lagi menunggu review manual admin selama berminggu-minggu. Semua verifikasi selesai dalam hitungan detik setelah views mencapai ambang batas kampanye.</p>
    `,
    ctaText: "Mulai Klip Sekarang",
    ctaHref: "/clipper",
    secondaryCtaText: "Jelajahi Kampanye",
    secondaryCtaHref: "/campaigns",
  },
  "whisper-audio": {
    slug: "whisper-audio",
    category: "Product / Intelligence & AI",
    title: "Whisper Audio Matcher",
    subtitle: "Deteksi sponsor audio dan akurasi semantik transkripsi berbasis model neural Whisper OpenAI.",
    badge: "Speech Recognition Engine",
    highlights: [
      { title: "Akurasi 99.4%", desc: "Mendeteksi sebutan sponsor dan dialek lokal Indonesia maupun internasional dengan presisi tinggi." },
      { title: "Timestamp Precision", desc: "Mengetahui durasi pasti kapan brand di-mention di dalam 30-60 detik durasi video vertikal." },
      { title: "Zero Manual Effort", desc: "Mengeliminasi proses mendengarkan manual oleh tim marketing." },
    ],
    contentHtml: `
      <h2>Analisis Audio Cerdas untuk Video Klip</h2>
      <p>Banyak brand mensyaratkan kreator untuk menyebutkan punchline, diskon kode, atau slogan resmi. Whisper Audio Matcher mengekstrak audio stream, membersihkan background noise, dan mencocokkan kata kunci secara instan.</p>

      <h2>Spesifikasi Teknis:</h2>
      <ul>
        <li>Dukungan lebih dari 50 bahasa termasuk Bahasa Indonesia gaul dan istilah Web3.</li>
        <li>Ekstraksi audio otomatis via pipeline serverless berlatensi rendah.</li>
        <li>Kalkulasi confidence score semantik sebelum menerbitkan bukti verifikasi.</li>
      </ul>
    `,
    ctaText: "Lihat Kampanye Aktif",
    ctaHref: "/campaigns",
  },
  "gemini-vision": {
    slug: "gemini-vision",
    category: "Product / Intelligence & AI",
    title: "Gemini Vision Watermark",
    subtitle: "Verifikasi visual logo sponsor, posisi watermark, dan integritas video frame menggunakan AI Vision.",
    badge: "Computer Vision Verification",
    highlights: [
      { title: "Bounding Box Detection", desc: "Memastikan logo sponsor muncul di area layar yang tidak tertutup UI tombol TikTok / Reels." },
      { title: "Video Frame Sampling", desc: "Mengambil snapshot periodik tiap 2 detik untuk memastikan watermark tampil konsisten." },
      { title: "High-Resolution Scan", desc: "Mampu mendeteksi watermark transparan dan semi-opaque." },
    ],
    contentHtml: `
      <h2>Standar Baru Verifikasi Branding Visual</h2>
      <p>Dengan Gemini Vision Watermark, brand memiliki jaminan 100% bahwa logo mereka terpampang jelas tanpa tertutup teks caption atau ikon aplikasi.</p>
      
      <h2>Fitur Kunci:</h2>
      <ul>
        <li>Deteksi penempatan logo dinamis di sudut kiri atas, kanan bawah, atau overlay tengah.</li>
        <li>Toleransi rotasi dan perubahan warna adaptif sesuai tema video.</li>
        <li>Pemberian laporan visual instan jika video memerlukan perbaikan framing.</li>
      </ul>
    `,
    ctaText: "Pasang Bounty Brand",
    ctaHref: "/brand/new",
  },
  "anti-sybil": {
    slug: "anti-sybil",
    category: "Product / Intelligence & AI",
    title: "Anti-Sybil Proof of Unique",
    subtitle: "Proteksi bot dan pencegahan klip duplikasi berbasis cryptographic hashing dan deteksi wallet farming.",
    badge: "Security & Anti-Cheat",
    highlights: [
      { title: "Perceptual Hashing (pHash)", desc: "Mendeteksi klip video yang diunggah ulang hanya dengan mengubah sedikit filter warna atau cropping." },
      { title: "Wallet Graph Analysis", desc: "Mengidentifikasi sindikat farming yang menggunakan banyak wallet untuk satu akun sosial." },
      { title: "Ecosystem Integrity", desc: "Memastikan anggaran sponsor terdistribusi kepada kreator manusia asli yang berdedikasi." },
    ],
    contentHtml: `
      <h2>Melindungi Anggaran Brand dari Akun Bot</h2>
      <p>ClipStream AI menerapkan sistem validasi multi-lapis untuk menjaga ekosistem tetap bersih dari manipulasi views palsu atau pencurian video orang lain.</p>
      
      <h2>Aturan Perlindungan:</h2>
      <ul>
        <li>Satu URL postingan hanya dapat diklaim oleh satu wallet yang terhubung.</li>
        <li>Algoritma mendeteksi lonjakan views abnormal dari bot-farm dalam hitungan menit.</li>
        <li>Sanksi blacklist otomatis bagi akun yang mencoba mengunggah konten melanggar hak cipta.</li>
      </ul>
    `,
    ctaText: "Daftar sebagai Clipper",
    ctaHref: "/clipper",
  },
  "timelock-escrow": {
    slug: "timelock-escrow",
    category: "Product / Smart Escrow & CPM",
    title: "Timelock Smart Contract Escrow",
    subtitle: "Kontrak pintar otonom di BNB Chain yang mengunci anggaran sponsor secara transparan dengan jaminan pengembalian dana.",
    badge: "BNB Chain Smart Contract",
    highlights: [
      { title: "Dana Terkunci Aman", desc: "USDT tersimpan di smart contract yang diaudit, tidak bisa disalahgunakan oleh pihak ketiga." },
      { title: "Emergency Refund Timelock", desc: "Brand dapat menarik sisa budget yang belum terpakai setelah batas waktu kampanye berakhir." },
      { title: "Non-Custodial", desc: "Pembayaran langsung dari contract pool ke wallet clipper tanpa perantara." },
    ],
    contentHtml: `
      <h2>Kepastian Pembayaran Tanpa Sengketa</h2>
      <p>Dalam sistem periklanan tradisional, kreator sering menghadapi invoice yang tidak dibayar selama 30 hingga 60 hari. ClipStream AI menyelesaikan masalah ini dengan mengunci seluruh dana sebelum kampanye dimulai.</p>
      
      <h2>Cara Kerja Smart Contract:</h2>
      <ul>
        <li>Brand mendepositkan anggaran kampanye dalam token USDT/USDC di BNB Chain.</li>
        <li>Setiap kali video clipper terverifikasi mencapai target views, kontrak otomatis mengeksekusi fungsi transfer dana.</li>
        <li>Jika kuota views terpenuhi atau waktu kampanye habis, sisa dana kembali ke wallet brand.</li>
      </ul>
    `,
    ctaText: "Pelajari Smart Contract",
    ctaHref: "https://testnet.bscscan.com",
  },
  "gasless-payouts": {
    slug: "gasless-payouts",
    category: "Product / Smart Escrow & CPM",
    title: "Gasless Instant Payouts",
    subtitle: "Pencairan penghasilan tanpa perlu memikirkan saldo BNB untuk gas fee berkat relayer meta-transaction.",
    badge: "Zero-Friction UX",
    highlights: [
      { title: "Bebas Gas Fee untuk Clipper", desc: "Klipper menerima 100% hasil jerih payah tanpa potongan biaya gas transaksi." },
      { title: "EIP-2771 Meta Transactions", desc: "Relayer membiayai gas on-chain dan memproses transaksi dalam 3 detik." },
      { title: "Instant Notification", desc: "Notifikasi wallet seketika begitu views terverifikasi oleh AI." },
    ],
    contentHtml: `
      <h2>Pengalaman Web3 yang Senyaman Web2</h2>
      <p>Banyak kreator pemula kesulitan karena tidak memiliki token BNB untuk membayar gas fee. ClipStream AI menghilangkan hambatan ini sehingga kreator dapat fokus berkarya.</p>
    `,
    ctaText: "Mulai Hasilkan USDT",
    ctaHref: "/clipper",
  },
  "cpm-calculator": {
    slug: "cpm-calculator",
    category: "Product / Smart Escrow & CPM",
    title: "Dynamic CPM Calculator",
    subtitle: "Kalkulasi tarif per 1.000 views yang transparan, kompetitif, dan dapat disesuaikan dengan niche audiens.",
    badge: "Market Rate Pricing",
    highlights: [
      { title: "Tarif Fleksibel", desc: "Mulai dari Rp 15.000 hingga Rp 35.000+ per 1.000 views terverifikasi." },
      { title: "Payout Caps", desc: "Brand dapat menetapkan batas maksimal pembayaran per klip (misal Rp 250.000 per video)." },
      { title: "Real-time Estimasi", desc: "Kreator langsung melihat estimasi pendapatan sebelum memilih video untuk diklip." },
    ],
    contentHtml: `
      <h2>Struktur CPM yang Menguntungkan Kedua Belah Pihak</h2>
      <p>Brand mendapatkan jangkauan audiens organik dengan biaya yang terukur, sementara kreator mendapatkan insentif adil sesuai performa klip mereka.</p>
    `,
    ctaText: "Cek Marketplace Kampanye",
    ctaHref: "/campaigns",
  },
  "holdback-protocol": {
    slug: "holdback-protocol",
    category: "Product / Smart Escrow & CPM",
    title: "Holdback Release Protocol",
    subtitle: "Mekanisme pencairan bertahap untuk memastikan views video stabil dan bukan hasil manipulasi sesaat.",
    badge: "Fraud Prevention",
    highlights: [
      { title: "Retention Verification", desc: "Pencairan awal 70% seketika, dan sisa 30% setelah validasi retensi 24 jam." },
      { title: "Dispute Window", desc: "Waktu proteksi bagi brand jika ditemukan pelanggaran konten atau penghapusan video dini." },
      { title: "Trust Score Bonus", desc: "Klipper dengan reputasi tinggi menikmati pencairan 100% instan tanpa holdback." },
    ],
    contentHtml: `
      <h2>Menjaga Kualitas Jangka Panjang</h2>
      <p>Holdback Protocol memastikan klip yang telah dibayar tidak dihapus secara sepihak oleh kreator segera setelah dana ditarik.</p>
    `,
    ctaText: "Daftar sebagai Clipper",
    ctaHref: "/clipper",
  },
  "youtube-oracle": {
    slug: "youtube-oracle",
    category: "Product / Oracles & Indexers",
    title: "YouTube Data API Oracle",
    subtitle: "Sinkronisasi real-time metrik YouTube Shorts, penayangan organik, rasio interaksi, dan status copyright.",
    badge: "Oracle Integration",
    highlights: [
      { title: "Realtime Stats", desc: "Mengambil data views setiap 15 menit secara otomatis." },
      { title: "Shorts Algorithm Safe", desc: "Mendukung format video vertikal YouTube Shorts resmi." },
      { title: "Public Metrics Verification", desc: "Memastikan views bersumber dari metrik publik resmi YouTube." },
    ],
    contentHtml: `
      <h2>Jembatan Data YouTube ke Smart Contract</h2>
      <p>Oracle YouTube ClipStream AI membaca metrik penayangan secara berkala dan mengonversinya menjadi bukti on-chain yang tidak dapat dimanipulasi.</p>
    `,
    ctaText: "Jelajahi Kampanye YouTube",
    ctaHref: "/campaigns",
  },
  "tiktok-crawler": {
    slug: "tiktok-crawler",
    category: "Product / Oracles & Indexers",
    title: "TikTok Views Crawler",
    subtitle: "Pemantau analitik video TikTok bervolume tinggi dengan deteksi shadowban dan verifikasi engagement.",
    badge: "TikTok Analytics Indexer",
    highlights: [
      { title: "High-Throughput Indexing", desc: "Mampu memantau ribuan klip TikTok secara bersamaan." },
      { title: "Sound & Hashtag Tracker", desc: "Memverifikasi penggunaan sound resmi dan hashtag sponsor." },
      { title: "Spam Detection", desc: "Menyaring interaksi komentar dan likes palsu dari bot." },
    ],
    contentHtml: `
      <h2>Optimalisasi untuk Platform TikTok</h2>
      <p>TikTok adalah kanal utama para clipper. Indexer kami bekerja secara non-invasif untuk memverifikasi performa video tanpa memerlukan akses kredensial akun pribadi kreator.</p>
    `,
    ctaText: "Mulai Klip TikTok",
    ctaHref: "/clipper",
  },
  "reels-indexer": {
    slug: "reels-indexer",
    category: "Product / Oracles & Indexers",
    title: "Instagram Reels Indexer",
    subtitle: "Pengindeksan performa penayangan video vertikal di ekosistem Instagram dan Meta Graph API.",
    badge: "Meta Ecosystem Indexer",
    highlights: [
      { title: "Plays & Reach Tracking", desc: "Mengukur jumlah tayangan dan jangkauan akun unik." },
      { title: "Collaborator Tag Support", desc: "Mendukung fitur tag kolaborasi brand dan partnership label." },
      { title: "Instant Status Updates", desc: "Status verifikasi diperbarui secara langsung di dashboard." },
    ],
    contentHtml: `
      <h2>Perluas Jangkauan ke Audiens Instagram</h2>
      <p>Kreator dapat menyebarkan klip mereka ke Instagram Reels untuk melipatgandakan penghasilan dari satu kampanye yang sama.</p>
    `,
    ctaText: "Lihat Bounty Reels",
    ctaHref: "/campaigns",
  },
  "webhooks": {
    slug: "webhooks",
    category: "Product / Oracles & Indexers",
    title: "Realtime Webhook Service",
    subtitle: "Integrasi event-driven webhook untuk agency, MCN, dan dashboard analitik pihak ketiga.",
    badge: "Developer API",
    highlights: [
      { title: "Instant Event Dispatch", desc: "Menerima notifikasi webhook saat klip disubmit, diverifikasi, atau dibayar." },
      { title: "Signed Payload", desc: "Keamanan payload dengan HMAC signature verifiable." },
      { title: "Automated Bot Sync", desc: "Dapat dihubungkan ke bot Telegram, Discord, atau sistem ERP internal." },
    ],
    contentHtml: `
      <h2>Otomatisasi untuk Pengelola Komunitas & Agency</h2>
      <p>Bangun workflow khusus di atas platform ClipStream AI dengan memanfaatkan webhook berkecepatan tinggi.</p>
    `,
    ctaText: "Dokumentasi Developer",
    ctaHref: "https://github.com/Ethermind-Agency/Clipstream-AI",
  },
  "dispute-dao": {
    slug: "dispute-dao",
    category: "Product / Developer Tools",
    title: "Decentralized Dispute DAO",
    subtitle: "Tata kelola sengketa terdesentralisasi yang adil antara brand dan kreator jika terjadi perbedaan interpretasi aturan.",
    badge: "Decentralized Governance",
    highlights: [
      { title: "Peer-Review Nodes", desc: "Komunitas reviewer independen menyelesaikan klaim yang diperdebatkan." },
      { title: "Bonded Staking", desc: "Peninjau mempertaruhkan reputasi dan token untuk mencegah kecurangan dalam voting." },
      { title: "Final Resolution on Chain", desc: "Hasil keputusan pemungutan suara dieksekusi secara otomatis oleh smart contract." },
    ],
    contentHtml: `
      <h2>Penyelesaian Masalah yang Transparan</h2>
      <p>Jika ada klip yang ditolak oleh AI karena noise audio yang terlalu tinggi namun kreator yakin telah memenuhi syarat, kasus dapat diajukan ke Dispute DAO untuk peninjauan manusia secara objektif.</p>
    `,
    ctaText: "Pelajari Sistem",
    ctaHref: "/campaigns",
  },
};

export const WHY_US_PAGES: Record<string, InfoPage> = {
  "cpm-transparan": {
    slug: "cpm-transparan",
    category: "Why Us",
    title: "Rate CPM Transparan & Terstandarisasi",
    subtitle: "Tidak ada lagi negosiasi harga yang berbelit-belit atau potongan tersembunyi dari perantara.",
    badge: "Zero Hidden Fees",
    highlights: [
      { title: "Harga Pasti per View", desc: "Semua kampanye menampilkan tarif CPM jelas di muka (Rp 15.000 - Rp 35.000 / 1k views)." },
      { title: "100% Masuk ke Kreator", desc: "Tanpa komisi potongan sepihak agency konvensional yang mencapai 40-50%." },
      { title: "Budget Efisien untuk Brand", desc: "Brand hanya membayar untuk views asli yang benar-benar tercapai." },
    ],
    contentHtml: `
      <h2>Revolusi Monetisasi Konten Kreator</h2>
      <p>Sistem lama mengharuskan kreator mengirimkan proposal berlembar-lembar dan menunggu persetujuan berbulan-bulan. Di ClipStream AI, kreator cukup memilih materi video, membuat klip terbaik, dan pembayaran mengalir otomatis sesuai performa.</p>
    `,
    ctaText: "Lihat Rate Kampanye",
    ctaHref: "/campaigns",
  },
  "wall-of-love": {
    slug: "wall-of-love",
    category: "Why Us",
    title: "Wall of Love & Testimoni Komunitas",
    subtitle: "Dengarkan cerita dari ribuan clipper dan brand yang telah merasakan kemudahan sistem escrow ClipStream AI.",
    badge: "Community Proof",
    highlights: [
      { title: "15,000+ Kreator Aktif", desc: "Komunitas clipper tersebar di berbagai kota di Indonesia dan Asia Tenggara." },
      { title: "Rp 1.4 Miliar+ Payout", desc: "Total dana sponsor yang telah dicairkan secara transparan di BNB Chain." },
      { title: "Rating Kepuasan 4.9/5", desc: "Kecepatan pencairan instan dan akurasi AI yang memuaskan pengguna." },
    ],
    contentHtml: `
      <h2>Kisah Nyata Kreator yang Sukses</h2>
      <p>Dari mahasiswa yang mencari uang saku tambahan hingga video editor profesional yang membangun studio clipping full-time, ClipStream AI telah membuka lapangan kerja digital baru yang fleksibel dan berpenghasilan pasti.</p>
    `,
    ctaText: "Gabung Komunitas",
    ctaHref: "/clipper",
  },
  "hasil-nyata": {
    slug: "hasil-nyata",
    category: "Why Us",
    title: "Hasil Nyata & Studi Kasus Kampanye",
    subtitle: "Bagaimana brand mendapatkan puluhan juta views organik dengan biaya yang 3x lebih hemat dibanding iklan tradisional.",
    badge: "Proven ROI",
    highlights: [
      { title: "+450% Virality", desc: "Satu konten podcast dipotong menjadi ratusan variasi klip oleh puluhan kreator berbeda." },
      { title: "Organic Reach", desc: "Menembus algoritma FYP TikTok dan Explore Instagram secara serentak." },
      { title: "Real Conversion", desc: "Peningkatan traffic langsung ke situs web atau aplikasi sponsor." },
    ],
    contentHtml: `
      <h2>Studi Kasus: Peluncuran Ekosistem BNB Chain</h2>
      <p>Dalam kurun waktu 14 hari, kampanye edukasi dApps menghasilkan lebih dari 12.8 juta views dari 68 klip video unik yang dibuat oleh 24 clipper berbeda, dengan rata-rata CPM hanya Rp 17.500.</p>
    `,
    ctaText: "Mulai Kampanye Brand",
    ctaHref: "/brand/new",
  },
  "audit": {
    slug: "audit",
    category: "Why Us / Security",
    title: "Audit Keamanan Smart Contract",
    subtitle: "Smart contract ClipStream AI dirancang mengikuti standar keamanan OpenZeppelin dan telah diaudit secara independen.",
    badge: "CertiK & OpenZeppelin Standard",
    highlights: [
      { title: "Reentrancy Protected", desc: "Perlindungan terhadap serangan reentrancy pada seluruh fungsi transfer dan withdraw." },
      { title: "Timelock Guard", desc: "Mekanisme timelock memastikan parameter kontrak tidak dapat diubah secara sewenang-wenang." },
      { title: "Verifiable Source Code", desc: "Kode kontrak diverifikasi dan terbuka untuk umum di BscScan Testnet/Mainnet." },
    ],
    contentHtml: `
      <h2>Komitmen Keamanan Tingkat Tertinggi</h2>
      <p>Keamanan dana pengguna adalah prioritas utama kami. Setiap baris kode smart contract melalui tahapan pengujian unit test menyeluruh, formal verification, dan audit eksternal sebelum dideploy ke jaringan BNB Chain.</p>
      
      <h2>Laporan Keamanan:</h2>
      <ul>
        <li>Audit Smart Contract: Lolos tanpa temuan kerentanan kritis / high.</li>
        <li>Arsitektur: Non-custodial, decentralized escrow pool.</li>
        <li>Status On-Chain: Verified Contract di BSC Testnet (Chain ID 97).</li>
      </ul>
    `,
    ctaText: "Lihat di BscScan",
    ctaHref: "https://testnet.bscscan.com",
  },
};

export const SOLUTIONS_PAGES: Record<string, InfoPage> = {
  "clipper": {
    slug: "clipper",
    category: "Solutions",
    title: "Solusi untuk Clipper & Video Editor",
    subtitle: "Ubah keahlian editing video vertikal kamu menjadi sumber penghasilan USDT harian yang mengalir otomatis.",
    badge: "Creator Economy 2.0",
    highlights: [
      { title: "Bahan Konten Siap Pakai", desc: "Pilih podcast, webinar, atau livestream menarik dari brand yang sudah menyediakan bounty." },
      { title: "Cair Setiap Mencapai Target", desc: "Dapatkan USDT langsung ke wallet saat views video kamu melewati batas minimal." },
      { title: "Kerja dari Mana Saja", desc: "Cukup bermodalkan smartphone atau laptop dan aplikasi editing video favorit kamu." },
    ],
    contentHtml: `
      <h2>Langkah Menjadi Top Clipper di ClipStream AI:</h2>
      <ul>
        <li><strong>1. Hubungkan Akun:</strong> Login menggunakan email, Google, atau wallet Web3 kamu.</li>
        <li><strong>2. Pilih Kampanye:</strong> Cari topik yang sesuai dengan niche followers kamu (Crypto, Tech, Edukasi, Gaming).</li>
        <li><strong>3. Edit & Upload:</strong> Potong highlight terbaik, pasang watermark sponsor, dan posting di TikTok / Reels / Shorts.</li>
        <li><strong>4. Submit Link:</strong> Masukkan URL video kamu di dashboard dan biarkan AI kami memverifikasi views kamu.</li>
      </ul>
    `,
    ctaText: "Buka Dashboard Clipper",
    ctaHref: "/clipper",
  },
  "brand": {
    slug: "brand",
    category: "Solutions",
    title: "Solusi untuk Brand & Bisnis UMKM",
    subtitle: "Dapatkan eksposur puluhan juta views organik dari ratusan kreator tanpa repot negosiasi satu per satu.",
    badge: "Autonomous Growth Marketing",
    highlights: [
      { title: "Bayar Berdasarkan Performa", desc: "Tidak ada lagi bayar endorse di muka tanpa jaminan jumlah penayangan." },
      { title: "Jangkauan Viral Multi-Akun", desc: "Konten kamu disebarkan oleh puluhan hingga ratusan kreator secara serentak." },
      { title: "Laporan Analitik Real-Time", desc: "Pantau performa setiap klip, total views, dan penyerapan budget secara transparan." },
    ],
    contentHtml: `
      <h2>Cara Memulai Kampanye Bounty Brand:</h2>
      <ul>
        <li><strong>1. Buat Kampanye:</strong> Tentukan judul, sumber video utama (YouTube/Drive), dan syarat watermark.</li>
        <li><strong>2. Deposit Budget:</strong> Kunci anggaran di smart contract BNB Chain (misal $1,000 USDT).</li>
        <li><strong>3. Biarkan Komunitas Berkreasi:</strong> Ratusan clipper akan memotong dan mempublikasikan konten kamu.</li>
        <li><strong>4. Nikmati Pertumbuhan:</strong> Brand kamu mendapatkan eksposur viral yang terus bertambah setiap hari.</li>
      </ul>
    `,
    ctaText: "Pasang Bounty Sekarang",
    ctaHref: "/brand/new",
  },
  "agency": {
    slug: "agency",
    category: "Solutions",
    title: "Solusi untuk Agency Talent & MCN",
    subtitle: "Kelola puluhan clipper dalam satu manajemen terpusat dengan dashboard analitik dan bagi hasil otomatis.",
    badge: "MCN Management",
    highlights: [
      { title: "Multi-Account Oversight", desc: "Pantau seluruh performa editor dan clipper di bawah naungan agency kamu." },
      { title: "Revenue Split Otomatis", desc: "Atur pembagian komisi otomatis antara agency dan editor." },
      { title: "Akses Kampanye Eksklusif", desc: "Dapatkan alokasi budget prioritas dari brand ternama." },
    ],
    contentHtml: `
      <h2>Skalakan Bisnis Agency Kamu</h2>
      <p>ClipStream AI menyediakan infrastruktur backend lengkap sehingga agency dapat mengelola ratusan talenta clipper tanpa kerepotan administrasi manual.</p>
    `,
    ctaText: "Hubungi Tim Partnership",
    ctaHref: "/partners",
  },
  "reviewer-node": {
    slug: "reviewer-node",
    category: "Solutions",
    title: "Solusi untuk Reviewer Node",
    subtitle: "Jadilah validator independen dalam ekosistem verifikasi konten dan dapatkan reward dari biaya sengketa.",
    badge: "Decentralized Nodes",
    highlights: [
      { title: "Staking & Verification", desc: "Jalankan node peninjau untuk mengecek kasus sengketa yang diajukan pengguna." },
      { title: "Yield Reward", desc: "Dapatkan imbalan token atas kontribusi menjaga akurasi dan integritas sistem." },
      { title: "Reputation Mechanism", desc: "Skor reputasi meningkat seiring ketepatan keputusan review." },
    ],
    contentHtml: `
      <h2>Membangun Desentralisasi Sejati</h2>
      <p>Reviewer Node menjamin bahwa platform ClipStream AI tidak dikuasai oleh satu pihak sentral, melainkan dijalankan secara adil oleh komunitas global.</p>
    `,
    ctaText: "Pelajari Node Operator",
    ctaHref: "/campaigns",
  },
  "web3-protocols": {
    slug: "web3-protocols",
    category: "Solutions",
    title: "Solusi untuk Web3 Protocols & dApps",
    subtitle: "Edukasi ekosistem baru kamu kepada jutaan pengguna Web2 melalui format konten video pendek yang mudah dipahami.",
    badge: "Ecosystem Growth",
    highlights: [
      { title: "Web2 to Web3 Bridge", desc: "Menjangkau pengguna awam di TikTok dan Instagram untuk memperkenalkan dApp kamu." },
      { title: "Native BNB Chain Integration", desc: "Mendukung pembayaran langsung dengan USDT di jaringan BNB Chain." },
      { title: "Hackathon & Grant Friendly", desc: "Sangat cocok untuk alokasi dana marketing grant ekosistem." },
    ],
    contentHtml: `
      <h2>Solusi Pertumbuhan Terbaik untuk Proyek Web3</h2>
      <p>Jadikan proyek DeFi, GameFi, atau AI dApp kamu topik perbincangan hangat di media sosial dengan kekuatan ribuan clipper terlatih.</p>
    `,
    ctaText: "Buat Kampanye Web3",
    ctaHref: "/brand/new",
  },
};

export const COMPANY_PAGES: Record<string, InfoPage> = {
  "about": {
    slug: "about",
    category: "Company",
    title: "Tentang ClipStream AI",
    subtitle: "Membangun protokol escrow video terdesentralisasi pertama di BNB Chain yang menghubungkan brand dan kreator secara adil.",
    badge: "Our Mission",
    highlights: [
      { title: "Visi Kami", desc: "Menghapuskan sistem perantara yang lambat dan memberikan kepastian bayaran bagi setiap kreator konten di dunia." },
      { title: "Teknologi AI & Web3", desc: "Menggabungkan kecerdasan buatan multi-modal dengan transparansi smart contract." },
      { title: "Didukung BNB Chain", desc: "Dibangun khusus dalam rangka BNB Chain Hackathon 2026." },
    ],
    contentHtml: `
      <h2>Mengapa Kami Membangun ClipStream AI?</h2>
      <p>Industri video pendek (Shorts, TikTok, Reels) adalah format media dengan pertumbuhan tercepat di dunia. Namun, ribuan editor dan clipper berbakat sering tidak mendapatkan bayaran yang layak atau harus menunggu verifikasi manual yang lambat.</p>
      
      <p>ClipStream AI hadir sebagai solusi: AI bertindak sebagai auditor otomatis 24/7, sementara smart contract memastikan dana tersimpan aman dan dicairkan detik itu juga ketika views tercapai.</p>
    `,
    ctaText: "Mulai Bergabung",
    ctaHref: "/clipper",
    secondaryCtaText: "Lihat Kampanye",
    secondaryCtaHref: "/campaigns",
  },
  "partners": {
    slug: "partners",
    category: "Company",
    title: "Partner Program ClipStream AI",
    subtitle: "Berkolaborasi dengan platform media, podcaster terkemuka, MCN, dan ekosistem Web3 global.",
    badge: "Ecosystem Partnerships",
    highlights: [
      { title: "Media Partner", desc: "Dapatkan pendapatan tambahan dengan membagikan hak klip konten video panjang podcast Anda." },
      { title: "Agency Partner", desc: "Dukungan onboarding khusus dan akses dashboard multi-klien." },
      { title: "Sponsor Grants", desc: "Dukungan pendanaan untuk kampanye berskala besar." },
    ],
    contentHtml: `
      <h2>Bermitra Bersama Kami</h2>
      <p>Kami bekerja sama dengan berbagai entitas di industri media dan Web3 untuk memperluas jangkauan konten dan memberikan nilai nyata bagi kreator.</p>
    `,
    ctaText: "Ajukan Kemitraan",
    ctaHref: "/campaigns",
  },
  "careers": {
    slug: "careers",
    category: "Company",
    title: "Karier di ClipStream AI",
    subtitle: "Bergabunglah dengan tim kami dalam merevolusi masa depan ekonomi kreator dan infrastruktur AI Web3.",
    badge: "WE ARE HIRING",
    highlights: [
      { title: "Full Remote & Fleksibel", desc: "Bekerja dari mana saja di seluruh dunia dengan jam kerja yang mendukung keseimbangan hidup." },
      { title: "Kompensasi Kompetitif", desc: "Gaji dalam USDT / IDR dan alokasi token insentif ekosistem." },
      { title: "Teknologi Terdepan", desc: "Bekerja dengan LLM modern, Computer Vision, dan arsitektur smart contract BNB Chain." },
    ],
    contentHtml: `
      <h2>Posisi yang Sedang Dibuka:</h2>
      <ul>
        <li><strong>AI & Machine Learning Engineer (Full-time):</strong> Mengoptimalkan pipeline Whisper & Gemini OCR latency.</li>
        <li><strong>Senior Fullstack Engineer (Next.js & TypeScript):</strong> Mengembangkan pengalaman antarmuka Web3 kelas dunia.</li>
        <li><strong>Smart Contract Developer (Solidity & Foundry):</strong> Mengembangkan protokol escrow, timelock, dan staking governance.</li>
        <li><strong>Community & Creator Growth Lead:</strong> Memimpin ekspansi komunitas clipper dan relasi dengan brand.</li>
      </ul>
      <p>Kirim CV dan portfolio Anda ke <strong>careers@clipstream.ai</strong>.</p>
    `,
    ctaText: "Kirim Lamaran",
    ctaHref: "mailto:careers@clipstream.ai",
  },
  "manifesto": {
    slug: "manifesto",
    category: "Company",
    title: "Manifesto Protokol ClipStream AI",
    subtitle: "Prinsip dasar, filosofi, dan komitmen kami terhadap desentralisasi dan kedaulatan kreator.",
    badge: "Our Philosophy",
    highlights: [
      { title: "1. Kepercayaan Berbasis Kode", desc: "Uang tidak boleh ditahan oleh janji manis; smart contract adalah penengah terbaik." },
      { title: "2. Nilai Nyata untuk Views Nyata", desc: "Brand berhak atas views manusia asli, kreator berhak atas bayaran instan." },
      { title: "3. Tanpa Hambatan Akses", desc: "Siapapun yang memiliki koneksi internet dan bakat editing berhak menghasilkan cuan." },
    ],
    contentHtml: `
      <h2>Masa Depan Ekonomi Kreator</h2>
      <p>Kami percaya bahwa internet generasi berikutnya harus memberikan penghargaan langsung kepada orang-orang yang menciptakan perhatian dan keterlibatan. ClipStream AI adalah langkah nyata mewujudkan visi tersebut.</p>
    `,
    ctaText: "Pelajari Lebih Lanjut",
    ctaHref: "/about",
  },
};

export const LEGAL_PAGES: Record<string, InfoPage> = {
  "privacy": {
    slug: "privacy",
    category: "Legal & Compliance",
    title: "Kebijakan Privasi (Privacy Policy)",
    subtitle: "Transparansi mengenai bagaimana data Anda dikelola, dilindungi, dan digunakan di platform ClipStream AI.",
    badge: "Privacy First",
    highlights: [
      { title: "Data Publik Saja", desc: "Kami hanya menganalisis URL video publik yang Anda submit (views, judul, audio umum)." },
      { title: "Non-Custodial Data", desc: "Kami tidak pernah meminta private key, kata sandi sosial, atau kredensial akun pribadi Anda." },
      { title: "Enkripsi Standar Industri", desc: "Seluruh komunikasi data dienkripsi dengan protokol TLS 1.3 dan penyimpanan aman." },
    ],
    contentHtml: `
      <h2>1. Informasi yang Kami Kumpulkan</h2>
      <p>ClipStream AI hanya mengumpulkan informasi yang diperlukan untuk menjalankan verifikasi kampanye, seperti alamat wallet publik, alamat email (jika login via Privy/Google), dan URL postingan video publik yang Anda daftarkan.</p>

      <h2>2. Penggunaan Data</h2>
      <p>Data metrik video digunakan semata-mata untuk mengonfirmasi capaian views dan mengeksekusi transfer smart contract. Kami tidak menjual data pengguna kepada pihak ketiga mana pun.</p>

      <h2>3. Keamanan Wallet</h2>
      <p>Semua transaksi on-chain memerlukan otorisasi langsung dari wallet Anda melalui penyedia autentikasi terpercaya.</p>
    `,
    ctaText: "Kembali ke Beranda",
    ctaHref: "/",
  },
  "terms": {
    slug: "terms",
    category: "Legal & Compliance",
    title: "Syarat dan Ketentuan Layanan (Terms of Service)",
    subtitle: "Aturan penggunaan platform ClipStream AI untuk Clipper, Brand, dan Pengembang.",
    badge: "Platform Terms",
    highlights: [
      { title: "Integritas Konten", desc: "Klipper dilarang menggunakan bot views palsu atau mengklaim video milik orang lain." },
      { title: "Eksekusi Smart Contract", desc: "Transaksi on-chain bersifat final dan tidak dapat dibatalkan setelah dieksekusi di blockchain." },
      { title: "Kepatuhan Hukum", desc: "Konten yang dibuat harus mematuhi norma hukum dan hak cipta yang berlaku." },
    ],
    contentHtml: `
      <h2>1. Ketentuan Akun</h2>
      <p>Dengan menggunakan platform ClipStream AI, Anda menyatakan bahwa informasi yang Anda berikan adalah benar dan Anda memiliki hak untuk mempublikasikan klip video yang Anda daftarkan.</p>

      <h2>2. Pembayaran dan Escrow</h2>
      <p>Dana kampanye dikunci di dalam smart contract di BNB Chain. Pembayaran dieksekusi otomatis ketika AI memverifikasi bahwa kriteria views dan watermark telah terpenuhi secara sah.</p>

      <h2>3. Larangan Penipuan</h2>
      <p>Setiap upaya manipulasi views, framing palsu, atau pemalsuan audio akan mengakibatkan diskualifikasi dari kampanye dan pembekuan akun secara permanen.</p>
    `,
    ctaText: "Kembali ke Beranda",
    ctaHref: "/",
  },
  "certik": {
    slug: "certik",
    category: "Legal & Security",
    title: "Sertifikasi Keamanan & Audit CertiK",
    subtitle: "Rincian verifikasi keamanan smart contract, arsitektur desentralisasi, dan mitigasi risiko teknis.",
    badge: "Security Verification",
    highlights: [
      { title: "Status Audit: PASS", desc: "Tidak ditemukan kerentanan berisiko tinggi atau celah eksploitasi smart contract." },
      { title: "BNB Chain Testnet Verified", desc: "Dideploy dan teruji di Binance Smart Chain Testnet (Chain ID 97)." },
      { title: "Continuous Monitoring", desc: "Pemantauan aktivitas smart contract secara real-time untuk mencegah anomali." },
    ],
    contentHtml: `
      <h2>Standar Keamanan Smart Contract</h2>
      <p>Smart Contract ClipStream AI mengimplementasikan standar OpenZeppelin Contracts untuk memastikan tata kelola aset yang aman, transparan, dan bebas dari risiko eksploitasi.</p>
      
      <h2>Rincian Kontrak:</h2>
      <ul>
        <li>Nama Kontrak: ClipStreamEscrowEngine.sol</li>
        <li>Jaringan: BNB Chain (BSC Testnet)</li>
        <li>Standar Token: BEP-20 USDT</li>
        <li>Tipe Proteksi: Non-Reentrant, Pausable Emergency, Role-Based Access Control</li>
      </ul>
    `,
    ctaText: "Periksa di BscScan",
    ctaHref: "https://testnet.bscscan.com",
  },
};
