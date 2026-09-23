"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@privy-io/react-auth";
import { AuthGate } from "@/components/AuthGate";
import {
  type Clip,
} from "@/lib/api";
import {
  formatUsdt,
  formatIdr,
  formatViews,
  formatRelativeDate,
  formatDateTime,
  txExplorerUrl,
} from "@/lib/format";
import {
  Scissors,
  Plus,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Play,
  Wallet,
  Coins,
  ChevronRight,
  Eye,
  X,
  FileCheck2,
} from "lucide-react";
import { HoldbackSchedule, type HoldbackItem } from "@/components/HoldbackSchedule";

export default function ClipperDashboardPage() {
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");

  // Aggregated dynamic balances
  const [availableUsdt, setAvailableUsdt] = useState(16.43);
  const [holdbackUsdt, setHoldbackUsdt] = useState(7.04);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  const [holdbackItems, setHoldbackItems] = useState<HoldbackItem[]>([
    {
      id: "hb-1",
      clipId: "clip-seed-1",
      clipTitle: "Podcast Bincang Teknologi — Episode 42",
      amountUsdt: 4.71,
      unlockAt: new Date(Date.now() + 2 * 86400000), // 2 days
      status: "LOCKED",
    },
    {
      id: "hb-2",
      clipId: "clip-seed-2",
      clipTitle: "DeFi DEX Launch Campaign Highlights",
      amountUsdt: 2.33,
      unlockAt: new Date(Date.now() + 3 * 86400000), // 3 days
      status: "LOCKED",
    },
    {
      id: "hb-3",
      clipId: "clip-seed-3",
      clipTitle: "BNB Chain Ecosystem Spotlight Short",
      amountUsdt: 3.50,
      unlockAt: new Date(Date.now() - 3600_000), // Already unlocked!
      status: "UNLOCKED",
    },
  ]);

  const mockClips: Clip[] = [
    {
      id: "clip-seed-1",
      campaignId: "camp-seed-1",
      clipperId: user?.id ?? "clipper-1",
      url: "https://www.youtube.com/shorts/5-gWpX231y0",
      status: "ACTIVE",
      views: 52310,
      paidViews: 52310,
      releasedAmount: "10990000", // 10.99 USDT
      holdbackAmount: "4710000", // 4.71 USDT
      holdbackUnlockAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      matchScore: 0.87,
      safetyScore: 0.94,
      anomalyScore: 0.18,
      rejectionReason: null,
      txHash: "0x3b72c91a02938472199ac2b44910283748291023948aae921847192837192834",
      evidenceCid: "bafybeihdwdcefgh4dqkjv67ua4wm",
      onchainHash: "0x9c1e44af28172635489102938471928374819203948571928374615243546576",
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "clip-seed-2",
      campaignId: "camp-seed-2",
      clipperId: user?.id ?? "clipper-1",
      url: "https://www.youtube.com/shorts/k891023948a",
      status: "ACTIVE",
      views: 25890,
      paidViews: 25890,
      releasedAmount: "5440000", // 5.44 USDT
      holdbackAmount: "2330000", // 2.33 USDT
      holdbackUnlockAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      matchScore: 0.82,
      safetyScore: 0.91,
      anomalyScore: 0.15,
      rejectionReason: null,
      txHash: "0x892a0192384719283748192039485719283746152435465769c1e44af2817263",
      evidenceCid: "bafybeifk4920192837481920394857",
      onchainHash: "0x19283746152435465769c1e44af2817263548910293847192837481920394857",
      submittedAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    setClips(mockClips);
  }, []);

  const handleClaimHoldbackItem = async (itemId: string): Promise<string> => {
    const item = holdbackItems.find((i) => i.id === itemId);
    if (!item) return "0x";

    await new Promise((r) => setTimeout(r, 1500));
    const tx = "0x892a0192384719283748192039485719283746152435465769c1e44af2817263";

    setHoldbackItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "CLAIMED" as const } : i))
    );
    setAvailableUsdt((prev) => prev + item.amountUsdt);
    setHoldbackUsdt((prev) => Math.max(0, prev - item.amountUsdt));
    setClaimSuccessMessage(
      `Saldo holdback sebesar ${item.amountUsdt.toFixed(2)} USDT berhasil dicairkan ke wallet!`
    );
    setTimeout(() => setClaimSuccessMessage(null), 5000);

    return tx;
  };

  return (
    <AuthGate
      requiredRole="clipper"
      title="Masuk ke Dashboard Clipper"
      description="Silakan masuk atau hubungkan wallet kamu untuk melihat statistik performa klip, reward yang dapat diklaim, dan jadwal unlock holdback."
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          paddingTop: "6.5rem",
          paddingBottom: "6rem",
        }}
      >
      <div
        className="am-container"
        style={{
          maxWidth: "70rem",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        {/* Top Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#ecfdf5",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#059669",
              letterSpacing: "0.5px",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={14} />
            <span>AREA CLIPPER &amp; EDITOR VIDEO • BNB CHAIN</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#111111",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Dashboard Pendapatan
              </h1>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(17,17,17,0.65)",
                  marginTop: "0.5rem",
                  maxWidth: "38rem",
                  lineHeight: 1.5,
                }}
              >
                Pantau akumulasi saldo USDT dari klip terverifikasi, jadwal pencairan holdback 30%, serta riwayat transaksi smart contract di BNB Chain.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href="/campaigns"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(17,17,17,0.12)",
                  color: "#111",
                  textDecoration: "none",
                }}
              >
                <span>Cari Campaign Baru</span>
              </Link>

              <Link
                href="/clipper/submit"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Scissors size={16} />
                <span>Submit Klip Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Claim Success Banner */}
        {claimSuccessMessage && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "0.875rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.5rem",
              animation: "fade-in-up 0.2s ease-out",
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{claimSuccessMessage}</span>
          </div>
        )}

        {/* 4 Financial Stat Cards Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Card 1: Saldo Tersedia */}
          <div
            style={{
              backgroundColor: "#fbfaf9",
              borderRadius: "18px",
              padding: "1.25rem",
              border: "1px solid rgba(17,17,17,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase" }}>
                  Saldo Tersedia (Siap Tarik)
                </span>
                <Coins size={16} color="#059669" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
                {availableUsdt.toFixed(2)} USDT
              </div>
              <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
                ≈ Rp {(availableUsdt * 16300).toLocaleString("id-ID")}
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(17,17,17,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "#059669",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={14} />
              <span>Sudah masuk ke akun kamu</span>
            </div>
          </div>

          {/* Card 2: Saldo Tertahan */}
          <div
            style={{
              backgroundColor: "#fbfaf9",
              borderRadius: "18px",
              padding: "1.25rem",
              border: "1px solid rgba(17,17,17,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase" }}>
                  Saldo Tertahan (Holdback 30%)
                </span>
                <Lock size={16} color="#d97706" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
                {holdbackUsdt.toFixed(2)} USDT
              </div>
              <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
                ≈ Rp {(holdbackUsdt * 16300).toLocaleString("id-ID")}
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(17,17,17,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ color: "#d97706", fontWeight: 600 }}>
                {holdbackItems.filter((i) => i.status === "UNLOCKED").length > 0
                  ? "● Ada saldo siap klaim!"
                  : "⏳ Cooldown 72 jam"}
              </span>
              <span style={{ color: "rgba(17,17,17,0.5)" }}>
                {holdbackItems.filter((i) => i.status !== "CLAIMED").length} klip
              </span>
            </div>
          </div>

          {/* Card 3: Total Views Terverifikasi */}
          <div
            style={{
              backgroundColor: "#fbfaf9",
              borderRadius: "18px",
              padding: "1.25rem",
              border: "1px solid rgba(17,17,17,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase" }}>
                Views Terverifikasi AI
              </span>
              <Eye size={16} color="#7c3aed" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
              78,200 Views
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              Dari 2 klip Shorts/TikTok aktif
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "0.85rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#7c3aed",
                backgroundColor: "#f5f3ff",
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              ★ Gemini Vision OCR Verified
            </div>
          </div>

          {/* Card 4: Rata-rata CPM */}
          <div
            style={{
              backgroundColor: "#fbfaf9",
              borderRadius: "18px",
              padding: "1.25rem",
              border: "1px solid rgba(17,17,17,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase" }}>
                Estimasi Rata-rata CPM
              </span>
              <TrendingUp size={16} color="#e8400d" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
              Rp 24.500
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              Per 1.000 views terverifikasi
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "0.85rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#e8400d",
                backgroundColor: "#fff0ec",
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              ↑ 18% lebih tinggi dari platform lain
            </div>
          </div>
        </div>

        {/* Interactive Holdback Schedule with Live Countdown and On-Chain Claim */}
        <HoldbackSchedule
          items={holdbackItems}
          onClaimItem={handleClaimHoldbackItem}
        />

        {/* Clipper Clips List Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 600, color: "#111", margin: 0 }}>
                Klip Saya ({clips.length})
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.55)", marginTop: "2px" }}>
                Riwayat video Shorts yang kamu potong dan status verifikasi otomatis oleh AI Agent.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  backgroundColor: "#f4f3f0",
                  padding: "0.25rem",
                  borderRadius: "9999px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === "ALL" ? "#ffffff" : "transparent",
                    color: activeTab === "ALL" ? "#111" : "rgba(17,17,17,0.6)",
                  }}
                >
                  Semua Klip
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("APPROVED")}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === "APPROVED" ? "#ffffff" : "transparent",
                    color: activeTab === "APPROVED" ? "#111" : "rgba(17,17,17,0.6)",
                  }}
                >
                  Disetujui
                </button>
              </div>

              <button
                type="button"
                onClick={() => setClips([...mockClips])}
                style={{
                  padding: "0.45rem",
                  borderRadius: "50%",
                  border: "1px solid rgba(17,17,17,0.1)",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  color: "rgba(17,17,17,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Muat Ulang"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Clips List Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {clips.map((clip) => (
              <div
                key={clip.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "18px",
                  padding: "1.25rem 1.5rem",
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                  transition: "border-color 0.2s ease",
                }}
                className="hover:border-neutral-400"
              >
                {/* Left: Thumbnail & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flex: "1 1 360px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "56px",
                      borderRadius: "10px",
                      backgroundColor: "#161514",
                      position: "relative",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={18} fill="#ffffff" color="#ffffff" style={{ marginLeft: "2px" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "#059669",
                          backgroundColor: "#ecfdf5",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#059669" }} />
                        Disetujui
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>
                        Kecocokan Audio {Math.round((clip.matchScore ?? 0.87) * 100)}%
                      </span>
                    </div>

                    <a
                      href={clip.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#111",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                      className="hover:underline"
                    >
                      <span>{clip.url}</span>
                      <ExternalLink size={12} color="rgba(17,17,17,0.5)" />
                    </a>

                    <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", marginTop: "2px" }}>
                      {formatViews(clip.views)} views • Disubmit {formatRelativeDate(clip.submittedAt)}
                    </div>
                  </div>
                </div>

                {/* Right: Payout & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111" }}>
                      +{formatUsdt(clip.releasedAmount)} USDT
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>
                      ≈ {formatIdr(clip.releasedAmount)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedClip(clip)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.875rem",
                      borderRadius: "9999px",
                      backgroundColor: "#f4f3f0",
                      border: "none",
                      color: "#111",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                    }}
                    className="hover:bg-neutral-200"
                  >
                    <span>Rincian Payout</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Details Modal */}
      {selectedClip && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() => setSelectedClip(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "2rem",
              maxWidth: "32rem",
              width: "100%",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.25)",
              border: "1px solid rgba(17,17,17,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileCheck2 size={20} color="#059669" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", margin: 0 }}>
                  Rincian Verifikasi &amp; Payout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClip(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(17,17,17,0.4)",
                  padding: "0.25rem",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Status Verifikasi AI</span>
                <span style={{ fontWeight: 600, color: "#059669" }}>Lolos Validasi Otomatis (99.8%)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Total Views Terhitung</span>
                <span style={{ fontWeight: 600, color: "#111" }}>{formatViews(selectedClip.views)} views</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Dana Dicairkan (70%)</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>+{formatUsdt(selectedClip.releasedAmount)} USDT</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Dana Holdback (30%)</span>
                <span style={{ fontWeight: 600, color: "#d97706" }}>+{formatUsdt(selectedClip.holdbackAmount)} USDT</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Bukti Hash di IPFS</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#7c3aed" }}>
                  {selectedClip.evidenceCid}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(17,17,17,0.6)" }}>Tx Hash BNB Chain</span>
                {selectedClip.txHash ? (
                  <a
                    href={txExplorerUrl(selectedClip.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "#2563eb",
                      textDecoration: "underline",
                    }}
                  >
                    {selectedClip.txHash.slice(0, 10)}...{selectedClip.txHash.slice(-8)} ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.4)" }}>-</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: "1.75rem" }}>
              <button
                type="button"
                onClick={() => setSelectedClip(null)}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  borderRadius: "9999px",
                  backgroundColor: "#111",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGate>
  );
}
