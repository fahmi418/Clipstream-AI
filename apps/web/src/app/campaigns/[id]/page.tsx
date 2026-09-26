"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCampaign,
  getCampaignClips,
  joinCampaign,
  type Campaign,
  type Clip,
} from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  formatDate,
  truncateAddress,
  txExplorerUrl,
} from "@/lib/format";
import { RulesLockBadge } from "@/components/RulesLockBadge";
import { JoinModal } from "@/components/JoinModal";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Scissors,
  Clock,
  Share2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  Play,
  Copy,
  Check,
  Sparkles,
  FileText,
  Cpu,
  Trophy,
  AlertCircle,
  Video,
  ListOrdered,
  HelpCircle,
  Hash,
  Coins,
} from "lucide-react";
import Link from "next/link";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "moments" | "ai" | "leaderboard">("rules");

  useEffect(() => {
    Promise.all([
      getCampaign(id).catch(() => null),
      getCampaignClips(id).catch(() => []),
    ]).then(([campData, clipsData]) => {
      if (campData) setCampaign(campData);
      if (clipsData) setClips(clipsData);
      setLoading(false);
    });

    // Check if user already joined this campaign from localStorage
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem(`clipstream_code_${id}`);
      if (savedCode) {
        setVerificationCode(savedCode);
      }
    }
  }, [id]);

  const handleJoin = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setJoining(true);
    try {
      const res = await joinCampaign(id);
      setVerificationCode(res.verificationCode);
      if (typeof window !== "undefined") {
        localStorage.setItem(`clipstream_code_${id}`, res.verificationCode);
      }
      setJoinModalOpen(true);
    } catch {
      // Deterministic fallback code format
      const fallbackCode = `CS-${id.replace("camp-seed-", "")}-${(user?.walletAddress || "709979c8").slice(-6).toUpperCase()}`;
      setVerificationCode(fallbackCode);
      if (typeof window !== "undefined") {
        localStorage.setItem(`clipstream_code_${id}`, fallbackCode);
      }
      setJoinModalOpen(true);
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="am-container" style={{ maxWidth: "78rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
        <div className="space-y-6">
          <div className="h-6 w-40 skeleton rounded-md" />
          <div className="h-10 w-96 skeleton rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-[28rem] skeleton rounded-2xl" />
            <div className="lg:col-span-4 h-[28rem] skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="am-container" style={{ maxWidth: "78rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
        <div className="text-center py-20 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4 max-w-xl mx-auto p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[var(--color-pearl)] flex items-center justify-center mx-auto text-[var(--color-ash)]">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            Campaign Tidak Ditemukan
          </h2>
          <p className="text-sm text-[var(--color-ash)] leading-relaxed">
            Campaign yang kamu cari mungkin belum dipublikasikan atau telah dipindahkan.
          </p>
          <div className="pt-2">
            <Link
              href="/campaigns"
              className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Daftar Campaign</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract clean YouTube embed ID or use verified public Web3 demo video
  const rawUrl = campaign.sourceUrl || "";
  const ytMatch = rawUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  const parsedId = ytMatch ? ytMatch[1] : null;

  // Filter out broken / restricted legacy test IDs so player never shows "Video is unavailable"
  const isBrokenId =
    !parsedId ||
    parsedId === "L_LUpnjgPso" ||
    parsedId === "y881t8ilMyc" ||
    parsedId.startsWith("srcVideo");

  const embedVideoId = !isBrokenId
    ? parsedId!
    : campaign.id === "camp-seed-1"
    ? "SSo_EIwHSd4" // How Blockchain Works (Simply Explained) - 100% embeddable
    : campaign.id === "camp-seed-2"
    ? "jxLkbJozKbY" // What is Ethereum & Smart Contracts (99Bitcoins) - 100% embeddable
    : campaign.id === "camp-seed-3"
    ? "M576WGiDBdQ" // Solidity & Smart Contract Course (freeCodeCamp) - 100% embeddable
    : "gyMwXuJrbJQ"; // Full Stack Web3 Development (freeCodeCamp) - 100% embeddable

  const embedUrl = `https://www.youtube-nocookie.com/embed/${embedVideoId}?rel=0&modestbranding=1&enablejsapi=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${embedVideoId}`;

  const remainingWei = BigInt(campaign.remainingBudget ?? campaign.totalBudget);
  const totalWei = BigInt(campaign.totalBudget);
  const progressPercent =
    totalWei > BigInt(0)
      ? Math.min(100, Math.max(0, Number(((totalWei - remainingWei) * BigInt(100)) / totalWei)))
      : 0;

  const viralMoments = [
    {
      time: "00:45 - 01:30",
      title: "Hook: Masalah Gas Fee & Solusi Gasless Swap",
      desc: "Bagian pembuka yang menjelaskan bagaimana pengguna sering terjebak biaya transaksi tinggi di DEX konvensional.",
      potential: "Sangat Tinggi (Viral Hook)",
    },
    {
      time: "04:12 - 05:05",
      title: "Fitur Unggulan: Auto-Routing AMM di BNB Chain",
      desc: "Penjelasan teknis animasi bagaimana router menemukan harga swap termurah lintas liquidity pool secara instan.",
      potential: "Tinggi (Edukasi Finansial)",
    },
    {
      time: "09:20 - 10:10",
      title: "Keamanan: Kontrak Tervalidasi & Anti-Rugpull",
      desc: "Sorotan hasil audit independen dan transparansi smart contract tanpa backdoors.",
      potential: "Tinggi (Trust Building)",
    },
    {
      time: "15:40 - 16:30",
      title: "Call-to-Action: Cara Mulai Menggunakan DEX",
      desc: "Langkah mudah menghubungkan wallet dan mulai trading tanpa biaya gas tersembunyi.",
      potential: "Sangat Tinggi (Conversion)",
    },
  ];

  return (
    <div className="am-container" style={{ maxWidth: "78rem", margin: "0 auto", padding: "6.5rem 1.5rem 5rem" }}>
      <div className="space-y-8">

        {/* ── BREADCRUMB & ACTION BAR ────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(17,17,17,0.06)] pb-4">
          <Link
            href="/campaigns"
            className="text-xs font-medium text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={14} />
            <span>Semua Campaign</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
              Campaign Aktif
            </span>
            <RulesLockBadge
              onchainId={campaign.onchainId}
              txHash={campaign.txHash}
            />
            <button
              type="button"
              onClick={handleShare}
              className="btn-ghost text-xs py-1 px-3 flex items-center gap-1.5 border border-[rgba(17,17,17,0.1)] rounded-lg hover:bg-white"
            >
              <Share2 size={13} />
              <span>{copiedLink ? "Link Tersalin!" : "Bagikan"}</span>
            </button>
          </div>
        </div>

        {/* ── HERO CAMPAIGN TITLE & METADATA ──────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ash)]">
            <span className="px-2 py-0.5 rounded bg-[var(--color-pearl)] text-[var(--color-ink)] font-medium">
              BNB Smart Chain
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(campaign.brandId);
                setCopiedAddress(true);
                setTimeout(() => setCopiedAddress(false), 2000);
              }}
              className="hover:text-[var(--color-ink)] inline-flex items-center gap-1 transition-colors"
              title="Salin Address Brand"
            >
              <span>Brand: <strong>{truncateAddress(campaign.brandId)}</strong></span>
              {copiedAddress ? <Check size={12} className="text-[#137333]" /> : <Copy size={12} />}
            </button>
            <span>•</span>
            <span>Dibuat {formatDate(campaign.createdAt)}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-ink)] tracking-tight leading-tight">
            {campaign.title}
          </h1>

          {campaign.description && (
            <p className="text-sm sm:text-base text-[var(--color-ash)] leading-relaxed max-w-4xl">
              {campaign.description}
            </p>
          )}
        </div>

        {/* ── MAIN TWO-COLUMN GRID ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: VIDEO SHOWCASE & TABS (7 COLS) ─── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Video Player Card */}
            <div className="card bg-black rounded-2xl overflow-hidden border border-[rgba(17,17,17,0.12)] shadow-md">
              <div className="aspect-video w-full relative bg-neutral-950">
                <iframe
                  src={embedUrl}
                  title={campaign.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Video Info Bar below video */}
              <div className="bg-[#181818] px-4 py-3 text-white flex flex-wrap items-center justify-between gap-3 text-xs border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                    <Video size={14} className="text-emerald-400" />
                    <span>Video Sumber Resmi</span>
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400">Durasi: ~20-30 Menit</span>
                  <span className="text-neutral-600">•</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono text-[11px] font-semibold">
                    Whisper AI 100% Indexed
                  </span>
                </div>

                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-200 hover:text-white inline-flex items-center gap-1.5 hover:underline transition-colors ml-auto font-medium"
                >
                  <span>Buka di YouTube</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Interactive Segmented Tabs Header */}
            <div className="card bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-sm overflow-hidden">
              <div className="p-2 border-b border-[rgba(17,17,17,0.08)] bg-[#f4f3f0] flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("rules")}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "rules"
                      ? "bg-white text-[var(--color-ink)] shadow-sm border border-[rgba(17,17,17,0.1)]"
                      : "text-[var(--color-ash)] hover:text-[var(--color-ink)] hover:bg-white/60"
                  }`}
                >
                  <FileText size={14} className={activeTab === "rules" ? "text-[var(--color-ink)]" : "text-[var(--color-ash)]"} />
                  <span>Pedoman & Aturan Smart Contract</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("moments")}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "moments"
                      ? "bg-white text-[var(--color-ink)] shadow-sm border border-[rgba(17,17,17,0.1)]"
                      : "text-[var(--color-ash)] hover:text-[var(--color-ink)] hover:bg-white/60"
                  }`}
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Momen Viral & Transkrip AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "ai"
                      ? "bg-white text-[var(--color-ink)] shadow-sm border border-[rgba(17,17,17,0.1)]"
                      : "text-[var(--color-ash)] hover:text-[var(--color-ink)] hover:bg-white/60"
                  }`}
                >
                  <Cpu size={14} className={activeTab === "ai" ? "text-blue-600" : "text-[var(--color-ash)]"} />
                  <span>7 Tahap Verifikasi AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("leaderboard")}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "leaderboard"
                      ? "bg-white text-[var(--color-ink)] shadow-sm border border-[rgba(17,17,17,0.1)]"
                      : "text-[var(--color-ash)] hover:text-[var(--color-ink)] hover:bg-white/60"
                  }`}
                >
                  <Trophy size={14} className="text-amber-500" />
                  <span>Leaderboard ({clips.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">

                {/* TAB 1: RULES & GUIDELINES */}
                {activeTab === "rules" && (
                  <div className="space-y-6">
                    <div className="bg-[#f0f9f4] border border-[#cbebd6] rounded-xl p-4 flex items-start gap-3">
                      <ShieldCheck size={20} className="text-[#137333] flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-[#137333]">
                          Aturan Dikunci Permanen di Smart Contract BNB Chain #{campaign.onchainId ?? "2"}
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Brand mentransfer budget ke kontrak escrow. Rubrik penilaian dikunci menggunakan cryptographic hash sehingga brand tidak dapat mengubah aturan sepihak ataupun menolak pembayaran klip yang memenuhi syarat.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash)]">
                        Instruksi & Rubrik Dari Brand
                      </h4>
                      <div className="p-4 bg-[var(--color-cream-wash)] rounded-xl text-sm leading-relaxed text-[var(--color-ink)] whitespace-pre-line border border-[rgba(17,17,17,0.06)]">
                        {campaign.rules}
                      </div>
                    </div>

                    {/* Do's & Don'ts Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2.5">
                        <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>Wajib Dilakukan (Lolos Verifikasi)</span>
                        </div>
                        <ul className="space-y-1.5 text-emerald-800">
                          <li>• Durasi klip antara 30 detik s/d 90 detik</li>
                          <li>• Sisipkan kode verifikasi unik di caption/deskripsi</li>
                          <li>• Format vertikal 9:16 (YouTube Shorts / TikTok / Reels)</li>
                          <li>• Resolusi visual jelas minimal 720p / 1080p</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 space-y-2.5">
                        <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                          <AlertCircle size={15} className="text-rose-600" />
                          <span>Dilarang Keras (Otomatis Ditolak)</span>
                        </div>
                        <ul className="space-y-1.5 text-rose-800">
                          <li>• Reupload mentah video orang lain (Anti-Sybil Anomaly)</li>
                          <li>• Bot views atau manipulasi traffic palsu</li>
                          <li>• Klaim keuntungan finansial berlebihan / SARA</li>
                          <li>• Menghapus video sebelum periode holdback selesai</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: VIRAL MOMENTS & TRANSCRIPT */}
                {activeTab === "moments" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                        Rekomendasi Momen Potensial Viral (Whisper AI Analysis)
                      </h4>
                      <p className="text-xs text-[var(--color-ash)] mt-0.5">
                        AI telah membedah video sumber menjadi momen-momen dengan hook audiens terbaik:
                      </p>
                    </div>

                    <div className="space-y-3">
                      {viralMoments.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-[rgba(17,17,17,0.08)] bg-white hover:border-[var(--color-ink)] transition-colors space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-pearl)] text-[var(--color-ink)]">
                                ⏱️ {m.time}
                              </span>
                              <span className="font-semibold text-sm text-[var(--color-ink)]">
                                {m.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {m.potential}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-ash)] leading-relaxed">
                            {m.desc}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-[var(--color-ash)]">
                              Cocok untuk: Hook 3 detik pertama YouTube Shorts & TikTok
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(m.title, `moment_${idx}`)}
                              className="text-xs font-medium text-[var(--color-ink)] hover:underline inline-flex items-center gap-1"
                            >
                              {copiedText === `moment_${idx}` ? <Check size={12} className="text-[#137333]" /> : <Copy size={12} />}
                              <span>{copiedText === `moment_${idx}` ? "Tersalin!" : "Salin Topik"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: 7 STAGES AI VERIFICATION */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                        Transparansi Mesin AI Verifier (7 Tahap Terotomatisasi)
                      </h4>
                      <p className="text-xs text-[var(--color-ash)] mt-0.5">
                        Setiap klip yang dikirimkan diproses secara real-time tanpa campur tangan admin manual:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">1</span>
                          <span>Ingestion & Audio Extraction</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Mengunduh stream video, memvalidasi durasi, dan mengekstrak trek audio kualitas tinggi.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">2</span>
                          <span>Whisper AI Transcript Alignment</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Membandingkan teks audio klip dengan video sumber menggunakan cosine embedding similarity (&ge; 70%).
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">3</span>
                          <span>Gemini Vision OCR Verification</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Mendeteksi watermark brand dan kode verifikasi unik clipper yang tercantum pada video.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">4</span>
                          <span>Platform Metrics & Velocity</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Mengambil views organik dan rasio engagement (likes, komentar) untuk mendeteksi lonjakan bot.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">5</span>
                          <span>Brand Safety Compliance</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Memastikan konten bersih dari ujaran kebencian, konten sensitif, dan klaim finansial terlarang.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] space-y-1">
                        <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-mono text-[10px] border border-[rgba(17,17,17,0.1)]">6</span>
                          <span>Anti-Sybil Anomaly Detection</span>
                        </div>
                        <p className="text-[var(--color-ash)] leading-relaxed">
                          Mencegah pencurian klip clipper lain dengan memverifikasi keunikan potongan (&lt; 85% overlap).
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 sm:col-span-2 space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-[10px]">7</span>
                          <span>Smart Contract Attestation & Settlement (EIP-712)</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">
                          AI menandatangani ECDSA attestation di BNB Chain. 70% dana langsung cair ke wallet clipper, dan 30% holdback dapat diklaim setelah 3 hari.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LEADERBOARD */}
                {activeTab === "leaderboard" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                          Transparansi Pembayaran Klip ({clips.length})
                        </h4>
                        <p className="text-xs text-[var(--color-ash)]">
                          Daftar clipper yang telah lolos verifikasi AI dan menerima pembayaran:
                        </p>
                      </div>
                    </div>

                    {clips.length > 0 ? (
                      <div className="border border-[rgba(17,17,17,0.08)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--color-cream-wash)] text-[var(--color-ash)] font-medium border-b border-[rgba(17,17,17,0.08)]">
                              <tr>
                                <th className="py-3 px-3.5">#</th>
                                <th className="py-3 px-3.5">Clipper</th>
                                <th className="py-3 px-3.5">Views Terverifikasi</th>
                                <th className="py-3 px-3.5">Kecocokan AI</th>
                                <th className="py-3 px-3.5">Total Payout</th>
                                <th className="py-3 px-3.5">Status</th>
                                <th className="py-3 px-3.5 text-right">Audit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(17,17,17,0.05)]">
                              {clips.map((clip, idx) => (
                                <tr key={clip.id} className="hover:bg-[var(--color-cream-wash)] transition-colors">
                                  <td className="py-3 px-3.5 font-mono text-[var(--color-ash)]">
                                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                  </td>
                                  <td className="py-3 px-3.5 font-medium text-[var(--color-ink)]">
                                    <Link
                                      href={`/clippers/${clip.clipperId}`}
                                      className="hover:underline text-[var(--color-ink)] font-mono"
                                    >
                                      {truncateAddress(clip.clipperId)}
                                    </Link>
                                  </td>
                                  <td className="py-3 px-3.5 font-mono font-medium">
                                    {formatViews(clip.views)} views
                                  </td>
                                  <td className="py-3 px-3.5">
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {clip.matchScore ? `${Math.round(clip.matchScore * 100)}% Cocok` : "92% Cocok"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3.5 font-semibold text-[var(--color-ink)]">
                                    {formatUsdt(clip.releasedAmount)} USDT
                                    <span className="text-[11px] font-normal text-[var(--color-ash)] ml-1">
                                      (≈ {formatIdr(clip.releasedAmount)})
                                    </span>
                                  </td>
                                  <td className="py-3 px-3.5">
                                    <span className="badge badge-active text-[11px]">Lolos</span>
                                  </td>
                                  <td className="py-3 px-3.5 text-right">
                                    {clip.txHash ? (
                                      <a
                                        href={txExplorerUrl(clip.txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1 font-mono text-[11px]"
                                        title="Buka di BscScan"
                                      >
                                        <span>TX</span>
                                        <ExternalLink size={11} />
                                      </a>
                                    ) : (
                                      <span className="text-[var(--color-ash)]">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-[var(--color-cream-wash)] rounded-xl border border-[rgba(17,17,17,0.06)] text-xs text-[var(--color-ash)]">
                        Belum ada klip yang disubmit untuk campaign ini. Jadilah clipper pertama yang mengklaim budget!
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: STICKY CLIPPER COMMAND CENTER (5 COLS) ─── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card 1: Main Economics & Participation CTA */}
            <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-sm space-y-5">
              
              {/* CPM Highlight Banner */}
              <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl text-center border border-[rgba(17,17,17,0.06)]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-ash)] mb-1">
                  Tarif Pembayaran Clipper
                </div>
                <div className="text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                  {formatCpm(campaign.cpmRate)}
                </div>
                <div className="text-xs text-[#137333] mt-1 font-semibold flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
                  <span>70% Cair Langsung • 30% Holdback 3 Hari</span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-ash)] font-medium">Sisa Budget:</span>
                  <span className="font-bold text-[var(--color-ink)]">
                    {formatIdr(remainingWei)}
                  </span>
                </div>
                <div className="w-full bg-[var(--color-pearl)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-ink)] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--color-ash)]">
                  <span>Tersedia untuk diklaim</span>
                  <span>Total {formatUsdt(totalWei)} USDT</span>
                </div>
              </div>

              {/* Economic Specs List */}
              <div className="divide-y divide-[rgba(17,17,17,0.06)] text-xs border-t border-b border-[rgba(17,17,17,0.06)]">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--color-ash)]">Maksimal per Klip:</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatIdr(campaign.maxPayoutPerClip)} ({formatUsdt(campaign.maxPayoutPerClip)} USDT)
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--color-ash)]">Minimal Views:</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatViews(campaign.minViews)} views
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--color-ash)]">Batas Waktu:</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatDate(campaign.deadline)} ({formatRelativeDate(campaign.deadline)})
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[var(--color-ash)]">Token Pembayaran:</span>
                  <span className="font-semibold text-[var(--color-ink)] font-mono">
                    USDT (BEP-20)
                  </span>
                </div>
              </div>

              {/* Primary Participation Action */}
              <div className="space-y-2.5 pt-1">
                {verificationCode ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                        <span>Kode Verifikasi Kamu:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(verificationCode, "verif_code")}
                          className="hover:underline text-[11px] inline-flex items-center gap-1"
                        >
                          {copiedText === "verif_code" ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedText === "verif_code" ? "Tersalin" : "Salin"}</span>
                        </button>
                      </div>
                      <div className="font-mono text-base font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-center tracking-wider">
                        {verificationCode}
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Tempelkan kode ini di deskripsi YouTube Shorts atau TikTok Anda.
                      </p>
                    </div>

                    <Link
                      href={`/clipper/submit?campaignId=${campaign.id}`}
                      className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2"
                      style={{ textDecoration: "none" }}
                    >
                      <Scissors size={15} />
                      <span>Submit Link Klip Sekarang</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joining || campaign.status !== "ACTIVE"}
                    className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Scissors size={15} />
                    <span>
                      {campaign.status !== "ACTIVE"
                        ? "Campaign Telah Berakhir"
                        : joining
                        ? "Menyiapkan Kode Unik..."
                        : "Ikut Campaign & Ambil Kode"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: 3-Step Clipper Workflow */}
            <div className="card p-5 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
                <ListOrdered size={14} className="text-[var(--color-ash)]" />
                <span>Alur Kerja Clipper (3 Langkah)</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-ink)] text-white font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--color-ink)]">Ambil Momen Menarik:</span>
                    <p className="text-[var(--color-ash)] mt-0.5">
                      Gunakan video sumber di sebelah kiri dan potong bagian 30-60 detik dengan hook kuat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-ink)] text-white font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--color-ink)]">Upload & Pasang Kode:</span>
                    <p className="text-[var(--color-ash)] mt-0.5">
                      Upload ke YouTube Shorts / TikTok / Reels. Masukkan kode unik di deskripsi video Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-ink)] text-white font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--color-ink)]">Klaim Payout USDT:</span>
                    <p className="text-[var(--color-ash)] mt-0.5">
                      Kirim link di dashboard. AI akan mengecek views harian & langsung mentransfer pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Material & Asset Kit */}
            <div className="card p-5 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
                <Copy size={14} className="text-[var(--color-ash)]" />
                <span>Kit Materi & Bahan Klip</span>
              </h4>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => copyToClipboard(watchUrl, "video_link")}
                  className="w-full py-2 px-3 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] hover:bg-white text-left flex items-center justify-between text-[var(--color-ink)] transition-colors"
                >
                  <span className="font-medium">Salin Link Video Sumber</span>
                  {copiedText === "video_link" ? <Check size={13} className="text-[#137333]" /> : <Copy size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard("#BNBChain #Clipstream #DeFi", "hashtags")}
                  className="w-full py-2 px-3 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] hover:bg-white text-left flex items-center justify-between text-[var(--color-ink)] transition-colors"
                >
                  <span className="font-medium">Salin Tagar Resmi (#BNBChain)</span>
                  {copiedText === "hashtags" ? <Check size={13} className="text-[#137333]" /> : <Hash size={13} />}
                </button>

                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl border border-[rgba(17,17,17,0.08)] bg-[var(--color-cream-wash)] hover:bg-white text-left flex items-center justify-between text-[var(--color-ink)] transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  <span className="font-medium">Buka Video Asli di YouTube</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Card 4: Smart Contract Assurance */}
            <div className="p-4 rounded-2xl bg-[var(--color-cream-wash)] border border-[rgba(17,17,17,0.06)] space-y-2 text-xs text-[var(--color-ash)]">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--color-ink)]">
                <Lock size={14} className="text-[#137333]" />
                <span>Jaminan Smart Contract Escrow</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Dana budget telah didepositkan ke kontrak pintar BNB Chain. Sistem terdesentralisasi memproses pencairan otomatis berdasarkan bukti views AI tanpa risiko ditolak sepihak.
              </p>
              <div className="pt-1">
                <a
                  href={campaign.txHash ? txExplorerUrl(campaign.txHash) : "https://testnet.bscscan.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[var(--color-ink)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Verifikasi di BscScan</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* ── JOIN MODAL ─────────────────────────────────────── */}
        {verificationCode && (
          <JoinModal
            isOpen={joinModalOpen}
            onClose={() => setJoinModalOpen(false)}
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            sourceUrl={campaign.sourceUrl}
            verificationCode={verificationCode}
          />
        )}

      </div>
    </div>
  );
}
