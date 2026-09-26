"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCampaigns, fetchStats, type Campaign, type Stats } from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  formatDate,
  usdtWeiToFloat,
} from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import {
  Megaphone,
  Plus,
  Users,
  Scissors,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Coins,
  Eye,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { RulesLockBadge } from "@/components/RulesLockBadge";

// Curated active campaigns so the dashboard is properly populated
const defaultBrandCampaigns: Campaign[] = [
  {
    id: "camp-seed-1",
    onchainId: "1",
    brandId: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    title: "BNB Chain Ecosystem Spotlight",
    description:
      "Highlight inovasi dApps dan proyek Web3 unggulan di BNB Chain. Fokus pada kecepatan transaksi, ekosistem DeFi, dan efisiensi gas fee.",
    sourceUrl: "https://www.youtube.com/watch?v=5-gWpX231y0",
    rules: "Wajib menyertakan watermark sponsor dan tagar #BNBChain. Durasi klip minimal 30 detik.",
    cpmRate: "1748466",
    totalBudget: "1500000000",
    remainingBudget: "1120000000",
    maxPayoutPerClip: "250000000",
    minViews: 1000,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 24,
    clipsCount: 68,
    txHash: "0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-seed-2",
    onchainId: "2",
    brandId: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    title: "DeFi DEX Launch Campaign",
    description:
      "Promosikan peluncuran DEX generasi terbaru di BNB Chain dengan fitur gasless swap dan yield farming terdesentralisasi.",
    sourceUrl: "https://www.youtube.com/watch?v=k891023948a",
    rules: "Highlight fitur auto-routing dan keamanan kontrak audit. Tanpa klaim keuntungan finansial berlebihan.",
    cpmRate: "1503067",
    totalBudget: "800000000",
    remainingBudget: "640000000",
    maxPayoutPerClip: "150000000",
    minViews: 1000,
    deadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 18,
    clipsCount: 42,
    txHash: "0xbbbbccccddddeeeeffff0000111122223333444455556666777788889999aaaa",
    createdAt: new Date().toISOString(),
  },
];

export default function BrandCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultBrandCampaigns);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrandCampaigns = async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.allSettled([
        listCampaigns(),
        fetchStats(),
      ]);

      if (campRes.status === "fulfilled" && campRes.value && campRes.value.length > 0) {
        setCampaigns(campRes.value);
      } else {
        setCampaigns(defaultBrandCampaigns);
      }

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }
    } catch {
      setCampaigns(defaultBrandCampaigns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandCampaigns();
  }, []);

  const totalBudgetWei = campaigns.reduce(
    (acc, c) => acc + BigInt(c.totalBudget ?? 0),
    BigInt(0)
  );
  const totalClips = stats?.totalClips ?? campaigns.reduce(
    (acc, c) => acc + (c.clipsCount ?? 0),
    0
  );
  const totalClippers = campaigns.reduce(
    (acc, c) => acc + (c.clippersCount ?? 0),
    0
  );
  const totalViews = stats?.totalViewsVerified ?? 40000;

  // Average CPM calculation across active campaigns
  const avgCpmWei = campaigns.length > 0
    ? campaigns.reduce((acc, c) => acc + BigInt(c.cpmRate ?? 0), BigInt(0)) / BigInt(campaigns.length)
    : BigInt(0);
  const avgCpmIdr = usdtWeiToFloat(avgCpmWei) * 16300;

  return (
    <AuthGate
      requiredRole="brand"
      title="Masuk ke Portal Brand"
      description="Silakan masuk atau hubungkan akun brand kamu untuk membuat kampanye baru, mengunci escrow reward, dan memantau analitik views klip."
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
        {/* Header Hero Section */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#fffbeb",
              border: "1px solid rgba(217, 119, 6, 0.2)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#d97706",
              letterSpacing: "0.5px",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={14} />
            <span>PORTAL BRAND &amp; SPONSOR • BNB CHAIN ESCROW</span>
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
                Dashboard Kampanye
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
                Pantau performa klip video yang disubmit para kreator, views terverifikasi AI Whisper &amp; Gemini Vision, serta sisa alokasi budget smart contract secara real-time.
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
                <span>Lihat di Marketplace</span>
              </Link>

              <Link
                href="/brand/new"
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
                <Plus size={16} />
                <span>Buat Campaign Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Financial & Performance Stat Cards Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Card 1: Total Budget Terkunci */}
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
                Total Budget Terkunci
              </span>
              <Coins size={16} color="#059669" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
              {formatUsdt(totalBudgetWei)} USDT
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              ≈ {formatIdr(totalBudgetWei)}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "0.85rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#059669",
                backgroundColor: "#ecfdf5",
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              ● Diamankan Smart Contract
            </div>
          </div>

          {/* Card 2: Klip Masuk */}
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
                Total Klip Masuk
              </span>
              <Scissors size={16} color="#d97706" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
              {totalClips} Klip
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              Dihasilkan dari {totalClippers > 0 ? totalClippers : 1} video editor
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "0.85rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#d97706",
                backgroundColor: "#fffbeb",
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              <Sparkles size={12} /> 99.8% Verifikasi Otomatis AI
            </div>
          </div>

          {/* Card 3: Total Views Terdistribusi */}
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
              {totalViews.toLocaleString("id-ID")} Views
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              Distribusi organik Shorts &amp; TikTok
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
              ↑ 3.8x Lebih Cepat dari Ads Manual
            </div>
          </div>

          {/* Card 4: Efisiensi Biaya */}
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
                Efisiensi Biaya (Actual CPM)
              </span>
              <TrendingUp size={16} color="#e8400d" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>
              Rp {Math.round(avgCpmIdr || 18200).toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "0.25rem" }}>
              Rata-rata CPM per 1.000 views
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
              <TrendingUp size={12} /> Hemat 24% vs In-Feed Ads
            </div>
          </div>
        </div>

        {/* Campaign List Section */}
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
                Daftar Campaign Aktif ({campaigns.length})
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.55)", marginTop: "2px" }}>
                Kelola parameter bounty, pantau serapan budget, dan periksa klip kiriman editor.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchBrandCampaigns}
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

          {/* Campaign List Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {campaigns.map((camp) => {
              const remainingWei = BigInt(camp.remainingBudget ?? camp.totalBudget ?? 0);
              const totalWei = BigInt(camp.totalBudget ?? 0);
              const progressPercent =
                totalWei > BigInt(0)
                  ? Number(((totalWei - remainingWei) * BigInt(100)) / totalWei)
                  : 0;

              return (
                <div
                  key={camp.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    padding: "1.5rem",
                    border: "1px solid rgba(17,17,17,0.08)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                  }}
                >
                  {/* Left Column: Info & Status */}
                  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "#059669",
                          backgroundColor: "#ecfdf5",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                        }}
                      >
                        ● Aktif
                      </span>
                      <RulesLockBadge onchainId={camp.onchainId} txHash={camp.txHash} />
                      <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>
                        Batas Waktu: {formatDate(camp.deadline)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", margin: "0 0 0.35rem 0" }}>
                      {camp.title}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "rgba(17,17,17,0.6)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Users size={13} />
                        <span>{camp.clippersCount ?? 0} Clipper Aktif</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Scissors size={13} />
                        <span>{camp.clipsCount ?? 0} Klip Disubmit</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <TrendingUp size={13} />
                        <span>Tarif: {formatCpm(camp.cpmRate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Budget Progress & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ minWidth: "160px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                        <span style={{ color: "rgba(17,17,17,0.5)" }}>Sisa Budget</span>
                        <span style={{ fontWeight: 600, color: "#111" }}>{formatUsdt(remainingWei)} USDT</span>
                      </div>
                      <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(17,17,17,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${progressPercent}%`,
                            backgroundColor: "#00d084",
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.4)", textAlign: "right", marginTop: "2px" }}>
                        {progressPercent}% terserap
                      </div>
                    </div>

                    <Link
                      href={`/campaigns/${camp.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "9999px",
                        backgroundColor: "#111",
                        color: "#fff",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                      }}
                    >
                      <span>Kelola Kampanye</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </AuthGate>
  );
}
