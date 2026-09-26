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
  XCircle,
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
    setJoining(true);
    try {
      // 1. If user is logged in, try registering participant on backend API
      const res = await joinCampaign(id);
      if (res && res.verificationCode) {
        setVerificationCode(res.verificationCode);
        if (typeof window !== "undefined") {
          localStorage.setItem(`clipstream_code_${id}`, res.verificationCode);
        }
        setJoinModalOpen(true);
        setJoining(false);
        return;
      }
    } catch {
      // Fallback if unauthenticated or demo mode
    }

    // 2. Generate clean deterministic unique code immediately
    const cleanId = id.replace("camp-seed-", "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "1";
    const userWallet = user?.walletAddress || "";
    const suffix = userWallet
      ? userWallet.slice(-6).toUpperCase()
      : Math.random().toString(36).substring(2, 8).toUpperCase();
    const fallbackCode = `CS-${cleanId}-${suffix}`;

    setVerificationCode(fallbackCode);
    if (typeof window !== "undefined") {
      localStorage.setItem(`clipstream_code_${id}`, fallbackCode);
    }
    setJoinModalOpen(true);
    setJoining(false);
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
      <div style={{ backgroundColor: "#f6f5f3", minHeight: "100vh", paddingTop: "6.5rem", paddingBottom: "5rem" }}>
        <div className="am-container" style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ height: "1.5rem", width: "10rem", backgroundColor: "#e8e7e4", borderRadius: "8px" }} />
            <div style={{ height: "2.5rem", width: "24rem", backgroundColor: "#e8e7e4", borderRadius: "10px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              <div style={{ height: "28rem", backgroundColor: "#e8e7e4", borderRadius: "20px" }} />
              <div style={{ height: "28rem", backgroundColor: "#e8e7e4", borderRadius: "20px" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ backgroundColor: "#f6f5f3", minHeight: "100vh", paddingTop: "7.5rem", paddingBottom: "5rem" }}>
        <div className="am-container" style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              border: "1px solid rgba(17,17,17,0.08)",
              padding: "3rem 2rem",
              boxShadow: "0 4px 20px -2px rgba(17,17,17,0.04)",
            }}
          >
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "50%",
                backgroundColor: "#f4f3f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "#6d6c6b",
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111111", marginBottom: "0.75rem" }}>
              Campaign Tidak Ditemukan
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#6d6c6b", lineHeight: 1.6, marginBottom: "2rem" }}>
              Campaign yang kamu cari mungkin telah berakhir atau ID tidak sesuai. Silakan jelajahi campaign aktif lainnya.
            </p>
            <Link
              href="/campaigns"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                backgroundColor: "#111111",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Katalog Campaign</span>
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
      title: "Hook: Mengapa Gas Fee Sering Tinggi & Solusi Gasless Swap",
      desc: "Bagian pembuka yang menjelaskan bagaimana pengguna sering terjebak biaya transaksi tinggi di DEX konvensional dan bagaimana solusi BNB Chain mengatasinya.",
      potential: "Sangat Tinggi (Viral Hook)",
    },
    {
      time: "04:12 - 05:05",
      title: "Fitur Unggulan: Auto-Routing AMM di Ekosistem BNB Chain",
      desc: "Penjelasan teknis animasi bagaimana router menemukan harga swap termurah lintas liquidity pool secara instan dengan slippage minimal.",
      potential: "Tinggi (Edukasi Finansial)",
    },
    {
      time: "09:20 - 10:10",
      title: "Keamanan: Kontrak Tervalidasi & Anti-Rugpull Escrow",
      desc: "Sorotan hasil audit independen dan transparansi smart contract tanpa celah manipulasi admin sepihak.",
      potential: "Tinggi (Trust Building)",
    },
    {
      time: "15:40 - 16:30",
      title: "Call-to-Action: Cara Mulai Menggunakan DEX & Mendapat Reward",
      desc: "Langkah mudah menghubungkan wallet dan mulai memanfaatkan swap terdesentralisasi tanpa ribet.",
      potential: "Sangat Tinggi (Conversion)",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f6f5f3",
        minHeight: "100vh",
        paddingTop: "6.5rem",
        paddingBottom: "5rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="am-container" style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* ── BREADCRUMB & ACTION BAR ────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid rgba(17,17,17,0.08)",
            }}
          >
            <Link
              href="/campaigns"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#555552",
                textDecoration: "none",
                padding: "0.4rem 0.85rem",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(17,17,17,0.08)",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowLeft size={14} />
              <span>Semua Campaign</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid rgba(5,150,105,0.25)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#059669",
                    display: "inline-block",
                  }}
                />
                Campaign Aktif
              </span>

              <RulesLockBadge
                onchainId={campaign.onchainId}
                txHash={campaign.txHash}
              />

              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#111111",
                  border: "1px solid rgba(17,17,17,0.1)",
                  cursor: "pointer",
                }}
              >
                <Share2 size={13} />
                <span>{copiedLink ? "Link Tersalin!" : "Bagikan"}</span>
              </button>
            </div>
          </div>

          {/* ── HERO CAMPAIGN TITLE & METADATA ──────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.8125rem", color: "#6d6c6b" }}>
              <span
                style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(17,17,17,0.08)",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                BNB Smart Chain (BEP-20)
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(campaign.brandId);
                  setCopiedAddress(true);
                  setTimeout(() => setCopiedAddress(false), 2000);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "inherit",
                  color: "inherit",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                title="Salin Address Brand"
              >
                <span>Brand: <strong style={{ color: "#111111" }}>{truncateAddress(campaign.brandId)}</strong></span>
                {copiedAddress ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              </button>
              <span>•</span>
              <span>Dibuat {formatDate(campaign.createdAt)}</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 800,
                color: "#111111",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {campaign.title}
            </h1>

            {campaign.description && (
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#555552",
                  lineHeight: 1.6,
                  maxWidth: "52rem",
                  margin: 0,
                }}
              >
                {campaign.description}
              </p>
            )}
          </div>

          {/* ── MAIN TWO-COLUMN GRID ───────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >

            {/* ── LEFT COLUMN: VIDEO SHOWCASE & TABS (65%) ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", gridColumn: "span 2" }}>

              {/* Video Player Card */}
              <div
                style={{
                  backgroundColor: "#000000",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid rgba(17,17,17,0.12)",
                  boxShadow: "0 10px 30px -5px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", backgroundColor: "#0a0a0a" }}>
                  <iframe
                    src={embedUrl}
                    title={campaign.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Video Info Bar below video */}
                <div
                  style={{
                    backgroundColor: "#141414",
                    padding: "0.85rem 1.25rem",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    fontSize: "0.75rem",
                    borderTop: "1px solid #222222",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#e5e5e5", fontWeight: 600 }}>
                      <Video size={14} color="#10b981" />
                      <span>Video Sumber Resmi</span>
                    </span>
                    <span style={{ color: "#555555" }}>•</span>
                    <span style={{ color: "#a3a3a3" }}>Durasi: ~20-30 Menit</span>
                    <span style={{ color: "#555555" }}>•</span>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor: "#262626",
                        color: "#34d399",
                        fontFamily: "monospace",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                      }}
                    >
                      Whisper AI 100% Indexed
                    </span>
                  </div>

                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#e5e5e5",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontWeight: 600,
                    }}
                  >
                    <span>Buka Video Asli di YouTube</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* ── INTERACTIVE SEGMENTED PILL TABS CARD ─────────────── */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 4px 20px -2px rgba(17,17,17,0.03)",
                  overflow: "hidden",
                }}
              >
                {/* Segmented Pill Navigation Bar */}
                <div
                  style={{
                    backgroundColor: "#eeedea",
                    margin: "1rem",
                    padding: "5px",
                    borderRadius: "16px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("rules")}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "140px",
                      padding: "0.6rem 1rem",
                      borderRadius: "12px",
                      border: activeTab === "rules" ? "1px solid rgba(17,17,17,0.08)" : "none",
                      backgroundColor: activeTab === "rules" ? "#ffffff" : "transparent",
                      color: activeTab === "rules" ? "#111111" : "#6d6c6b",
                      boxShadow: activeTab === "rules" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      fontSize: "0.8125rem",
                      fontWeight: activeTab === "rules" ? 700 : 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <FileText size={14} color={activeTab === "rules" ? "#111111" : "#6d6c6b"} />
                    <span>Pedoman & Aturan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("moments")}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "140px",
                      padding: "0.6rem 1rem",
                      borderRadius: "12px",
                      border: activeTab === "moments" ? "1px solid rgba(17,17,17,0.08)" : "none",
                      backgroundColor: activeTab === "moments" ? "#ffffff" : "transparent",
                      color: activeTab === "moments" ? "#111111" : "#6d6c6b",
                      boxShadow: activeTab === "moments" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      fontSize: "0.8125rem",
                      fontWeight: activeTab === "moments" ? 700 : 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Sparkles size={14} color="#d97706" />
                    <span>Momen Viral AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("ai")}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "140px",
                      padding: "0.6rem 1rem",
                      borderRadius: "12px",
                      border: activeTab === "ai" ? "1px solid rgba(17,17,17,0.08)" : "none",
                      backgroundColor: activeTab === "ai" ? "#ffffff" : "transparent",
                      color: activeTab === "ai" ? "#111111" : "#6d6c6b",
                      boxShadow: activeTab === "ai" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      fontSize: "0.8125rem",
                      fontWeight: activeTab === "ai" ? 700 : 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Cpu size={14} color={activeTab === "ai" ? "#2563eb" : "#6d6c6b"} />
                    <span>7 Tahap AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("leaderboard")}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "140px",
                      padding: "0.6rem 1rem",
                      borderRadius: "12px",
                      border: activeTab === "leaderboard" ? "1px solid rgba(17,17,17,0.08)" : "none",
                      backgroundColor: activeTab === "leaderboard" ? "#ffffff" : "transparent",
                      color: activeTab === "leaderboard" ? "#111111" : "#6d6c6b",
                      boxShadow: activeTab === "leaderboard" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      fontSize: "0.8125rem",
                      fontWeight: activeTab === "leaderboard" ? 700 : 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Trophy size={14} color="#d97706" />
                    <span>Leaderboard ({clips.length})</span>
                  </button>
                </div>

                {/* Tab Contents Area */}
                <div style={{ padding: "0 1.5rem 1.75rem" }}>

                  {/* TAB 1: RULES & GUIDELINES */}
                  {activeTab === "rules" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {/* Escrow Guarantee Pill Card */}
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "14px",
                          padding: "1rem 1.25rem",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                        }}
                      >
                        <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div style={{ fontSize: "0.8125rem" }}>
                          <div style={{ fontWeight: 700, color: "#065f46", marginBottom: "0.25rem" }}>
                            Aturan Dikunci Permanen di Smart Contract BNB Chain #{campaign.onchainId ?? "2"}
                          </div>
                          <p style={{ color: "#047857", lineHeight: 1.5, margin: 0 }}>
                            Brand telah mendepositkan budget ke escrow smart contract. Rubrik penilaian dikunci menggunakan cryptographic hash sehingga brand tidak dapat membatalkan atau mengubah syarat pembayaran secara sepihak.
                          </p>
                        </div>
                      </div>

                      {/* Instructions from Brand */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6d6c6b", margin: 0 }}>
                          Instruksi & Rubrik Dari Brand
                        </h4>
                        <div
                          style={{
                            padding: "1.25rem",
                            backgroundColor: "#fbfaf8",
                            borderRadius: "14px",
                            fontSize: "0.9375rem",
                            lineHeight: 1.6,
                            color: "#111111",
                            whiteSpace: "pre-line",
                            border: "1px solid rgba(17,17,17,0.06)",
                          }}
                        >
                          {campaign.rules}
                        </div>
                      </div>

                      {/* Do's & Don'ts Checklist */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                        <div
                          style={{
                            padding: "1.25rem",
                            borderRadius: "14px",
                            border: "1px solid #d1fae5",
                            backgroundColor: "#f0fdf4",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                            <CheckCircle2 size={16} color="#059669" />
                            <span>Wajib Dilakukan (Lolos Verifikasi)</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "#047857" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <Check size={13} color="#059669" />
                              <span>Durasi klip antara 30 detik s/d 90 detik</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <Check size={13} color="#059669" />
                              <span>Sisipkan kode verifikasi unik di caption/deskripsi</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <Check size={13} color="#059669" />
                              <span>Format vertikal 9:16 (YouTube Shorts / TikTok / Reels)</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <Check size={13} color="#059669" />
                              <span>Resolusi visual jelas minimal 720p / 1080p</span>
                            </li>
                          </ul>
                        </div>

                        <div
                          style={{
                            padding: "1.25rem",
                            borderRadius: "14px",
                            border: "1px solid #ffe4e6",
                            backgroundColor: "#fff1f2",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#9f1239", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                            <XCircle size={16} color="#e11d48" />
                            <span>Dilarang Keras (Otomatis Ditolak)</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "#be123c" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <XCircle size={13} color="#e11d48" />
                              <span>Reupload mentah video orang lain (Anti-Sybil Anomaly)</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <XCircle size={13} color="#e11d48" />
                              <span>Bot views atau manipulasi traffic palsu</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <XCircle size={13} color="#e11d48" />
                              <span>Klaim keuntungan finansial berlebihan / SARA</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <XCircle size={13} color="#e11d48" />
                              <span>Menghapus video sebelum periode holdback selesai</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: VIRAL MOMENTS & TRANSCRIPT */}
                  {activeTab === "moments" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111111", margin: 0 }}>
                          Rekomendasi Momen Potensial Viral (Whisper AI Analysis)
                        </h4>
                        <p style={{ fontSize: "0.8125rem", color: "#6d6c6b", marginTop: "0.25rem" }}>
                          AI telah membedah video sumber menjadi momen-momen dengan hook audiens terbaik:
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {viralMoments.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "1rem 1.25rem",
                              borderRadius: "14px",
                              border: "1px solid rgba(17,17,17,0.08)",
                              backgroundColor: "#ffffff",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "6px", backgroundColor: "#f4f3f0", color: "#111111" }}>
                                  <Clock size={12} /> {m.time}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111111" }}>
                                  {m.title}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#b45309" }}>
                                {m.potential}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.8125rem", color: "#555552", lineHeight: 1.5, margin: 0 }}>
                              {m.desc}
                            </p>
                            <div style={{ paddingTop: "0.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
                              <span style={{ color: "#888888" }}>Cocok untuk: Hook 3 detik pertama YouTube Shorts & TikTok</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(m.title, `moment_${idx}`)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "#111111",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                {copiedText === `moment_${idx}` ? <Check size={12} color="#059669" /> : <Copy size={12} />}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111111", margin: 0 }}>
                          Transparansi Mesin AI Verifier (7 Tahap Terotomatisasi)
                        </h4>
                        <p style={{ fontSize: "0.8125rem", color: "#6d6c6b", marginTop: "0.25rem" }}>
                          Setiap klip yang dikirimkan diproses secara real-time tanpa campur tangan admin manual:
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem", fontSize: "0.75rem" }}>
                        {[
                          { num: 1, title: "Ingestion & Audio Extraction", desc: "Mengunduh stream video, memvalidasi durasi, dan mengekstrak trek audio kualitas tinggi." },
                          { num: 2, title: "Whisper AI Transcript Alignment", desc: "Membandingkan teks audio klip dengan video sumber menggunakan cosine embedding similarity (≥ 70%)." },
                          { num: 3, title: "Gemini Vision OCR Verification", desc: "Mendeteksi watermark brand dan kode verifikasi unik clipper yang tercantum pada video." },
                          { num: 4, title: "Platform Metrics & Velocity", desc: "Mengambil views organik dan rasio engagement (likes, komentar) untuk mendeteksi lonjakan bot." },
                          { num: 5, title: "Brand Safety Compliance", desc: "Memastikan konten bersih dari ujaran kebencian, konten sensitif, dan klaim finansial terlarang." },
                          { num: 6, title: "Anti-Sybil Anomaly Detection", desc: "Mencegah pencurian klip clipper lain dengan memverifikasi keunikan potongan (< 85% overlap)." },
                        ].map((stage) => (
                          <div
                            key={stage.num}
                            style={{
                              padding: "0.85rem 1rem",
                              borderRadius: "12px",
                              border: "1px solid rgba(17,17,17,0.08)",
                              backgroundColor: "#fbfaf8",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                            }}
                          >
                            <div style={{ fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ffffff", border: "1px solid rgba(17,17,17,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "0.625rem" }}>
                                {stage.num}
                              </span>
                              <span>{stage.title}</span>
                            </div>
                            <p style={{ color: "#6d6c6b", lineHeight: 1.5, margin: 0 }}>
                              {stage.desc}
                            </p>
                          </div>
                        ))}

                        <div
                          style={{
                            gridColumn: "1 / -1",
                            padding: "0.85rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid #bbf7d0",
                            backgroundColor: "#f0fdf4",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#059669", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "0.625rem" }}>
                              7
                            </span>
                            <span>Smart Contract Attestation & Settlement (EIP-712)</span>
                          </div>
                          <p style={{ color: "#047857", lineHeight: 1.5, margin: 0 }}>
                            AI menandatangani ECDSA attestation di BNB Chain. 70% dana langsung cair ke wallet clipper, dan 30% holdback dapat diklaim setelah 3 hari.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: LEADERBOARD */}
                  {activeTab === "leaderboard" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111111", margin: 0 }}>
                          Transparansi Pembayaran Klip ({clips.length})
                        </h4>
                        <p style={{ fontSize: "0.8125rem", color: "#6d6c6b", marginTop: "0.25rem" }}>
                          Daftar clipper yang telah lolos verifikasi AI dan menerima pembayaran:
                        </p>
                      </div>

                      {clips.length > 0 ? (
                        <div style={{ border: "1px solid rgba(17,17,17,0.08)", borderRadius: "14px", overflow: "hidden" }}>
                          <table style={{ width: "100%", textAlign: "left", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                            <thead style={{ backgroundColor: "#f4f3f0", color: "#6d6c6b", borderBottom: "1px solid rgba(17,17,17,0.08)" }}>
                              <tr>
                                <th style={{ padding: "0.75rem 1rem" }}>#</th>
                                <th style={{ padding: "0.75rem 1rem" }}>Clipper</th>
                                <th style={{ padding: "0.75rem 1rem" }}>Views Terverifikasi</th>
                                <th style={{ padding: "0.75rem 1rem" }}>Kecocokan AI</th>
                                <th style={{ padding: "0.75rem 1rem" }}>Total Payout</th>
                                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Audit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clips.map((clip, idx) => (
                                <tr key={clip.id} style={{ borderBottom: "1px solid rgba(17,17,17,0.05)" }}>
                                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", color: "#6d6c6b" }}>
                                    {idx === 0 ? (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#d97706", fontWeight: 700 }}>
                                        <Trophy size={14} /> #1
                                      </span>
                                    ) : idx === 1 ? (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#64748b", fontWeight: 700 }}>
                                        <Trophy size={14} /> #2
                                      </span>
                                    ) : idx === 2 ? (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#b45309", fontWeight: 700 }}>
                                        <Trophy size={14} /> #3
                                      </span>
                                    ) : (
                                      `#${idx + 1}`
                                    )}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#111111" }}>
                                    <Link href={`/clippers/${clip.clipperId}`} style={{ color: "inherit", textDecoration: "none", fontFamily: "monospace" }}>
                                      {truncateAddress(clip.clipperId)}
                                    </Link>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontWeight: 600 }}>
                                    {formatViews(clip.views)} views
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem" }}>
                                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, backgroundColor: "#ecfdf5", color: "#059669" }}>
                                      {clip.matchScore ? `${Math.round(clip.matchScore * 100)}% Cocok` : "92% Cocok"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#111111" }}>
                                    {formatUsdt(clip.releasedAmount)} USDT
                                    <span style={{ fontSize: "0.6875rem", fontWeight: 400, color: "#6d6c6b", marginLeft: "0.25rem" }}>
                                      (≈ {formatIdr(clip.releasedAmount)})
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem" }}>
                                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, backgroundColor: "#ecfdf5", color: "#059669" }}>
                                      Lolos
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                                    {clip.txHash ? (
                                      <a
                                        href={txExplorerUrl(clip.txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#6d6c6b", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                                        title="Buka di BscScan"
                                      >
                                        <span>TX</span>
                                        <ExternalLink size={11} />
                                      </a>
                                    ) : (
                                      <span style={{ color: "#999999" }}>—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "#fbfaf8", borderRadius: "14px", color: "#6d6c6b", fontSize: "0.8125rem" }}>
                          Belum ada klip yang disubmit untuk campaign ini. Jadilah clipper pertama!
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: HERO REWARD & ACTIONS (35%) ─────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Card 1: Main Payout Hero Box */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 4px 20px -2px rgba(17,17,17,0.04)",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6c6b" }}>
                    Tarif Pembayaran Clipper
                  </span>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginTop: "0.25rem" }}>
                    {formatCpm(campaign.cpmRate)}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem", padding: "0.25rem 0.65rem", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#059669", fontSize: "0.6875rem", fontWeight: 700 }}>
                    <span>• 70% Cair Langsung • 30% Holdback 3 Hari</span>
                  </div>
                </div>

                {/* Remaining Budget Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ color: "#6d6c6b" }}>Sisa Budget:</span>
                    <span style={{ fontWeight: 700, color: "#111111" }}>
                      {formatIdr(campaign.remainingBudget ?? campaign.totalBudget)}
                    </span>
                  </div>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "#f0efec", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(5, 100 - progressPercent)}%`,
                        backgroundColor: "#059669",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#888888" }}>
                    <span>Tersedia untuk diklaim</span>
                    <span>Total {formatUsdt(campaign.totalBudget)} USDT</span>
                  </div>
                </div>

                {/* Detail Metrics */}
                <div style={{ borderTop: "1px solid rgba(17,17,17,0.06)", borderBottom: "1px solid rgba(17,17,17,0.06)", padding: "0.5rem 0", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span style={{ color: "#6d6c6b" }}>Maksimal per Klip:</span>
                    <span style={{ fontWeight: 700, color: "#111111" }}>
                      {formatIdr(campaign.maxPayoutPerClip)} ({formatUsdt(campaign.maxPayoutPerClip)} USDT)
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span style={{ color: "#6d6c6b" }}>Minimal Views:</span>
                    <span style={{ fontWeight: 700, color: "#111111" }}>
                      {formatViews(campaign.minViews)} views
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span style={{ color: "#6d6c6b" }}>Batas Waktu:</span>
                    <span style={{ fontWeight: 700, color: "#111111" }}>
                      {formatDate(campaign.deadline)} ({formatRelativeDate(campaign.deadline)})
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span style={{ color: "#6d6c6b" }}>Token Pembayaran:</span>
                    <span style={{ fontWeight: 700, color: "#111111", fontFamily: "monospace" }}>
                      USDT (BEP-20)
                    </span>
                  </div>
                </div>

                {/* Primary Participation Action */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {verificationCode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "14px",
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", fontWeight: 700, color: "#065f46" }}>
                          <span>Kode Verifikasi Kamu:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(verificationCode, "verif_code")}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              fontSize: "0.6875rem",
                              color: "#059669",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontWeight: 700,
                            }}
                          >
                            {copiedText === "verif_code" ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedText === "verif_code" ? "Tersalin" : "Salin"}</span>
                          </button>
                        </div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "1.125rem",
                            fontWeight: 800,
                            color: "#065f46",
                            backgroundColor: "#ffffff",
                            padding: "0.5rem 1rem",
                            borderRadius: "10px",
                            border: "1px solid #a7f3d0",
                            textAlign: "center",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {verificationCode}
                        </div>
                        <p style={{ fontSize: "0.6875rem", color: "#047857", margin: 0, lineHeight: 1.4 }}>
                          Tempelkan kode unik ini di caption YouTube Shorts atau TikTok Anda.
                        </p>
                      </div>

                      <Link
                        href={`/clipper/submit?campaignId=${campaign.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "0.85rem 1.25rem",
                          borderRadius: "12px",
                          backgroundColor: "#111111",
                          color: "#ffffff",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        }}
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.9rem 1.25rem",
                        borderRadius: "12px",
                        backgroundColor: "#111111",
                        color: "#ffffff",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                      }}
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
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 4px 20px -2px rgba(17,17,17,0.04)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#111111", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                  <ListOrdered size={14} color="#6d6c6b" />
                  <span>Alur Kerja Clipper (3 Langkah)</span>
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#111111", color: "#ffffff", fontFamily: "monospace", fontSize: "0.6875rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      1
                    </div>
                    <div>
                      <strong style={{ color: "#111111" }}>Ambil Momen Menarik:</strong>
                      <p style={{ color: "#6d6c6b", margin: "0.2rem 0 0", lineHeight: 1.5 }}>
                        Gunakan video sumber di sebelah kiri dan potong bagian 30-60 detik dengan hook kuat.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#111111", color: "#ffffff", fontFamily: "monospace", fontSize: "0.6875rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      2
                    </div>
                    <div>
                      <strong style={{ color: "#111111" }}>Upload & Pasang Kode:</strong>
                      <p style={{ color: "#6d6c6b", margin: "0.2rem 0 0", lineHeight: 1.5 }}>
                        Upload ke YouTube Shorts / TikTok / Reels. Masukkan kode unik di deskripsi video Anda.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#111111", color: "#ffffff", fontFamily: "monospace", fontSize: "0.6875rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      3
                    </div>
                    <div>
                      <strong style={{ color: "#111111" }}>Klaim Payout USDT:</strong>
                      <p style={{ color: "#6d6c6b", margin: "0.2rem 0 0", lineHeight: 1.5 }}>
                        Kirim link di dashboard. AI akan mengecek views harian & langsung mentransfer pembayaran.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Material & Asset Kit */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 4px 20px -2px rgba(17,17,17,0.04)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#111111", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                  <Copy size={14} color="#6d6c6b" />
                  <span>Kit Materi & Bahan Klip</span>
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(watchUrl, "video_link")}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(17,17,17,0.08)",
                      backgroundColor: "#fbfaf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#111111",
                      cursor: "pointer",
                      fontSize: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    <span>Salin Link Video Sumber</span>
                    {copiedText === "video_link" ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard("#BNBChain #Clipstream #DeFi", "hashtags")}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(17,17,17,0.08)",
                      backgroundColor: "#fbfaf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#111111",
                      cursor: "pointer",
                      fontSize: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    <span>Salin Tagar Resmi (#BNBChain)</span>
                    {copiedText === "hashtags" ? <Check size={13} color="#059669" /> : <Hash size={13} />}
                  </button>

                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(17,17,17,0.08)",
                      backgroundColor: "#fbfaf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#111111",
                      textDecoration: "none",
                      fontSize: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    <span>Buka Video Asli di YouTube</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Card 4: Smart Contract Assurance */}
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "16px",
                  backgroundColor: "#eeedea",
                  border: "1px solid rgba(17,17,17,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#555552",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#111111" }}>
                  <Lock size={14} color="#059669" />
                  <span>Jaminan Smart Contract Escrow</span>
                </div>
                <p style={{ lineHeight: 1.5, margin: 0, fontSize: "0.6875rem" }}>
                  Dana budget telah didepositkan ke kontrak pintar BNB Chain. Sistem terdesentralisasi memproses pencairan otomatis berdasarkan bukti views AI tanpa risiko ditolak sepihak.
                </p>
                <div style={{ paddingTop: "0.25rem" }}>
                  <a
                    href={campaign.txHash ? txExplorerUrl(campaign.txHash) : "https://testnet.bscscan.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "#111111",
                      textDecoration: "underline",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
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
    </div>
  );
}
