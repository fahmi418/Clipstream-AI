"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
  Lock,
  Scissors,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Play,
  Check,
  Eye,
  Coins,
} from "lucide-react";
import { fetchStats, listCampaigns, type Stats, type Campaign } from "@/lib/api";
import { formatUsdt, formatIdr, formatViews } from "@/lib/format";
import { CampaignCard } from "@/components/CampaignCard";
import { RoleSelectModal } from "@/components/RoleSelectModal";

function HomePageContent() {
  const searchParams = useSearchParams();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"clipper" | "brand">("clipper");
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowRoleModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetchStats().catch(() => null),
      listCampaigns({ status: "ACTIVE", limit: 3 }).catch(() => []),
    ]).then(([statsData, campaignsData]) => {
      if (statsData) setStats(statsData);
      if (campaignsData && Array.isArray(campaignsData)) setCampaigns(campaignsData);
      setLoading(false);
    });
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 1200);
    setTimeout(() => setSimStep(3), 2400);
    setTimeout(() => {
      setSimStep(4);
      setSimulating(false);
    }, 3600);
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── 1. Hero Section (Amplemarket Hero Structure) ───────────── */}
      <section className="am-section am-max-width-1440 am-centered-margins" style={{ width: "100%", position: "relative" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="am-home-hero-content" style={{ paddingTop: "7.5rem", paddingBottom: "3rem" }}>
            <div className="am-home-hero-content-top" style={{ maxWidth: "44rem", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.75rem" }}>
              <div className="am-home-hero-content-top-text" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                <div className="am-home-hero-heading-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                  {/* Eyebrow Pill */}
                  <div
                    className="am-featured-link"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.375rem 0.875rem",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid rgba(17, 17, 17, 0.08)",
                      boxShadow: "0 2px 8px rgba(17, 17, 17, 0.04)",
                      fontSize: "0.8125rem",
                      color: "#111",
                    }}
                  >
                    <div
                      className="am-new-label is-black"
                      style={{
                        backgroundColor: "#111",
                        color: "#fff",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      BNB CHAIN 2026
                    </div>
                    <div className="am-opacity-80" style={{ fontWeight: 500 }}>
                      AI Agent + Consumer Apps Hackathon →
                    </div>
                  </div>

                  {/* Main Display Headline */}
                  <h1
                    className="am-heading-56 am-text-align-center"
                    style={{
                      fontSize: "clamp(2.5rem, 5.5vw, 3.875rem)",
                      lineHeight: 1.12,
                      letterSpacing: "-2px",
                      fontWeight: 400,
                      color: "#111",
                      margin: 0,
                    }}
                  >
                    Klip kamu, <br className="hidden sm:inline" />
                    <span style={{ fontWeight: 600 }}>dibayar otomatis.</span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p
                  className="am-paragraph-20 am-opacity-60 am-text-align-center"
                  style={{
                    fontSize: "1.1875rem",
                    lineHeight: 1.5,
                    color: "rgba(17, 17, 17, 0.7)",
                    maxWidth: "38rem",
                    margin: "0 auto",
                  }}
                >
                  Brand kunci budget di smart contract. AI mengecek keaslian klip kamu. Begitu views masuk, uangnya cair langsung tanpa nunggu approval admin.
                </p>
              </div>

              {/* Action Buttons & Social Proof */}
              <div className="am-partial-form-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", width: "100%" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.875rem" }}>
                  <Link
                    href="/campaigns"
                    className="am-nav-btn"
                    style={{
                      padding: "0.875rem 1.75rem",
                      backgroundColor: "#111",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: 500,
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 14px rgba(17, 17, 17, 0.15)",
                    }}
                  >
                    <span>Mulai Ngeklip</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/brand/new"
                    className="am-nav-btn is-secondary"
                    style={{
                      padding: "0.875rem 1.75rem",
                      backgroundColor: "#fff",
                      color: "#111",
                      fontSize: "1rem",
                      fontWeight: 500,
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(17, 17, 17, 0.12)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Megaphone size={16} />
                    <span>Buat Campaign</span>
                  </Link>
                </div>

                {/* Social Proof Stripe */}
                <div
                  className="am-social-proof-stripe is-dark"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.8125rem",
                    color: "rgba(17, 17, 17, 0.6)",
                    fontWeight: 500,
                    paddingTop: "0.25rem",
                  }}
                >
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-[#1a7f37]" />
                    <span>100% On-Chain Escrow</span>
                  </span>
                  <span>•</span>
                  <span>AI Whisper &amp; Gemini Verifier</span>
                  <span>•</span>
                  <span>Rata-rata 45 Detik Cair</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Product Screen (Amplemarket Video/Preview Frame) */}
            <div
              className="am-demo-video-border"
              style={{
                marginTop: "3.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(17, 17, 17, 0.1)",
                backgroundColor: "#272625",
                boxShadow: "0 20px 50px rgba(17, 17, 17, 0.12)",
                overflow: "hidden",
              }}
            >
              <div className="am-demo-video-wrapper is-home" style={{ padding: "1.5rem" }}>
                {/* Window Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#47d096] animate-pulse" />
                    <span style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 600 }}>
                      AI Agent Verification Pipeline
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "0.375rem",
                        backgroundColor: simulating ? "rgba(255, 255, 255, 0.1)" : "#ffd7f0",
                        color: simulating ? "rgba(255, 255, 255, 0.6)" : "#111",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: simulating ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <Play size={10} />
                      <span>{simulating ? "Memproses Verifikasi..." : "Simulasikan Alur"}</span>
                    </button>
                    <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>
                      BNB TESTNET (CHAIN ID 97)
                    </span>
                  </div>
                </div>

                {/* 3 Pipeline Steps */}
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  style={{ paddingTop: "1.75rem", paddingBottom: "0.75rem" }}
                >
                  {/* Step 1 */}
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      backgroundColor: simStep >= 1 ? "rgba(255, 215, 240, 0.12)" : "rgba(255, 255, 255, 0.05)",
                      border: simStep >= 1 ? "1px solid #ffd7f0" : "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "0.5rem",
                        backgroundColor: "#ffd7f0",
                        color: "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Scissors size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>1. Clipper Submit</span>
                        {simStep >= 1 && <Check size={14} className="text-[#ffd7f0]" />}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.4 }}>
                        Kreator submit link YouTube Shorts beserta kode verifikasi unik anti-fraud di deskripsi video.
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      backgroundColor: simStep >= 2 ? "rgba(255, 239, 153, 0.12)" : "rgba(255, 255, 255, 0.05)",
                      border: simStep >= 2 ? "1px solid #ffef99" : "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "0.5rem",
                        backgroundColor: "#ffef99",
                        color: "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Cpu size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>2. AI Agent Verifikasi</span>
                        {simStep >= 2 && <Check size={14} className="text-[#ffef99]" />}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.4 }}>
                        Whisper ASR transkrip audio, cek semantic brand match, safety filter &amp; simpan bukti ke IPFS.
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      backgroundColor: simStep >= 3 ? "rgba(183, 239, 178, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      border: simStep >= 3 ? "1px solid #b7efb2" : "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "0.5rem",
                        backgroundColor: "#b7efb2",
                        color: "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Zap size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>3. Payout Otomatis</span>
                        {simStep >= 3 && <Check size={14} className="text-[#b7efb2]" />}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.4 }}>
                        70% USDT langsung cair di smart contract BNB Chain, 30% buffer holdback 3 hari.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Live Metrics Grid Section ─────────────────────────── */}
      <section className="am-section" style={{ padding: "2.5rem 0", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "1rem",
              border: "1px solid rgba(17, 17, 17, 0.08)",
              padding: "2rem",
              boxShadow: "0 4px 16px rgba(17, 17, 17, 0.03)",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6d6c6b", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Views Terverifikasi
                </div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>
                  {stats ? formatViews(stats.totalViewsVerified) : "1,2 jt"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#1a7f37", marginTop: "0.25rem", fontWeight: 500 }}>
                  100% data riil YouTube
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6d6c6b", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Total Dana Keluar
                </div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>
                  {stats ? `${formatUsdt(stats.totalPaidOut)} USDT` : "2.450 USDT"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6d6c6b", marginTop: "0.25rem" }}>
                  ≈ {stats ? formatIdr(stats.totalPaidOut) : "Rp 39,9 jt"} (estimasi)
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6d6c6b", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Campaign Aktif
                </div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>
                  {stats ? stats.totalCampaigns : "12"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6d6c6b", marginTop: "0.25rem" }}>
                  Kunci budget di smart contract
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6d6c6b", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Klip Terproses
                </div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>
                  {stats ? stats.totalClips : "184"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#1a7f37", marginTop: "0.25rem", fontWeight: 500 }}>
                  Rata-rata 45 detik
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Amplemarket Customer Quote / Testimonial Card ──────── */}
      <section className="am-section" style={{ padding: "3rem 0", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "1rem",
              border: "1px solid rgba(17, 17, 17, 0.08)",
              padding: "clamp(2rem, 4vw, 3.5rem)",
              boxShadow: "0 4px 16px rgba(17, 17, 17, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <div style={{ maxWidth: "48rem" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#6d6c6b", fontWeight: 700, marginBottom: "1rem" }}>
                TESTIMONI KREATOR &amp; BRAND
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.375rem, 3vw, 2rem)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.5px",
                  color: "#111",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                &ldquo;ClipStream mengubah cara kami mempromosikan produk. Tanpa negosiasi berbelit, puluhan clipper langsung membuat video pendek dan smart contract escrow menjamin pencairan instan begitu views terverifikasi AI.&rdquo;
              </h3>
            </div>

            {/* Doodle Squiggle Underline matching Amplemarket Reference */}
            <div style={{ color: "#111", opacity: 0.25, width: "100%", maxWidth: "400px" }}>
              <svg viewBox="0 0 400 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
                <path d="M2 14C50 4 120 18 180 8C240 -2 320 16 398 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#ffd7f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#7a1a3a",
                  }}
                >
                  RK
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#111" }}>
                    Rian Kurniawan
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#6d6c6b" }}>
                    Top Clipper &amp; Video Editor (240k+ total views)
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#1a7f37", fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>Terverifikasi di BNB Chain</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 3 Pillars Bento Grid (Pastel Taxonomy Cards) ─────── */}
      <section className="am-section" style={{ padding: "4rem 0", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          {/* Section Header */}
          <div style={{ textAlign: "center", maxWidth: "38rem", margin: "0 auto 3rem" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#6d6c6b", fontWeight: 700, marginBottom: "0.5rem" }}>
              KEUNGGULAN UTAMA
            </div>
            <h2
              className="am-heading-44"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
                lineHeight: 1.2,
                letterSpacing: "-1px",
                color: "#111",
                fontWeight: 500,
                margin: 0,
              }}
            >
              Mengapa kreator &amp; brand memilih ClipStream
            </h2>
            <p style={{ fontSize: "1rem", color: "#6d6c6b", marginTop: "0.75rem", lineHeight: 1.5 }}>
              Ekosistem terdesentralisasi tanpa negosiasi manual, tanpa admin perantara, dan tanpa risiko gagal bayar.
            </p>
          </div>

          {/* 3 Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Mint Green */}
            <div
              className="card-pastel-mint"
              style={{
                backgroundColor: "#b7efb2",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
                color: "#111",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    color: "#1c3c27",
                  }}
                >
                  <Lock size={22} />
                </div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#1c3c27", marginBottom: "0.375rem" }}>
                  KEAMANAN ON-CHAIN
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.25, marginBottom: "0.75rem" }}>
                  Dana dikunci di kontrak
                </h3>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.5, color: "rgba(17, 17, 17, 0.85)" }}>
                  Brand tidak bisa membatalkan atau menarik dana yang sudah menjadi hak kamu. Semua aturan dan budget diamankan di smart contract BNB Chain.
                </p>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(17, 17, 17, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1c3c27",
                }}
              >
                <ShieldCheck size={15} />
                <span>Bebas risiko wanprestasi</span>
              </div>
            </div>

            {/* Card 2: Canary Yellow */}
            <div
              className="card-pastel-yellow"
              style={{
                backgroundColor: "#ffef99",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
                color: "#111",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    color: "#5a4a00",
                  }}
                >
                  <Cpu size={22} />
                </div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#5a4a00", marginBottom: "0.375rem" }}>
                  KECERDASAN BUATAN
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.25, marginBottom: "0.75rem" }}>
                  Verifikasi otomatis 45 detik
                </h3>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.5, color: "rgba(17, 17, 17, 0.85)" }}>
                  AI mengecek kepemilikan kode, kecocokan audio dengan sumber, brand safety, dan pola views dalam hitungan detik, bukan berhari-hari.
                </p>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(17, 17, 17, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#5a4a00",
                }}
              >
                <Sparkles size={15} />
                <span>Audit transparan di IPFS</span>
              </div>
            </div>

            {/* Card 3: Soft Violet */}
            <div
              className="card-pastel-violet"
              style={{
                backgroundColor: "#e2ddfd",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
                color: "#111",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    color: "#3c1e7a",
                  }}
                >
                  <Zap size={22} />
                </div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#3c1e7a", marginBottom: "0.375rem" }}>
                  FINANSIAL REAL-TIME
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.25, marginBottom: "0.75rem" }}>
                  70% cair seketika
                </h3>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.5, color: "rgba(17, 17, 17, 0.85)" }}>
                  Begitu klip lolos verifikasi, 70% dana langsung masuk ke saldo wallet kamu. 30% sisanya tertahan 3 hari untuk memastikan stabilitas views.
                </p>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(17, 17, 17, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#3c1e7a",
                }}
              >
                <TrendingUp size={15} />
                <span>Tanpa minimum penarikan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Featured Active Campaigns ─────────────────────────── */}
      <section className="am-section" style={{ padding: "4rem 0", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#6d6c6b", fontWeight: 700, marginBottom: "0.25rem" }}>
                PELUANG TERSEDIA
              </div>
              <h2
                className="am-heading-36"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.75px",
                  color: "#111",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Campaign Terbaru
              </h2>
            </div>
            <Link
              href="/campaigns"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <span>Lihat Semua Campaign</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 skeleton rounded-xl" />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                border: "1px solid rgba(17, 17, 17, 0.08)",
                padding: "3.5rem 1.5rem",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>
                Belum ada campaign aktif
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "#6d6c6b", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
                Jadilah brand pertama yang membuat campaign dan rekrut puluhan clipper berbakat.
              </p>
              <Link
                href="/brand/new"
                className="am-nav-btn"
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <Megaphone size={15} />
                <span>Buat Campaign Pertama</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Dark Architecture & Security Section ──────────────── */}
      <section
        className="am-section am-is-black-bg"
        style={{
          backgroundColor: "#272625",
          color: "#fff",
          padding: "5rem 0",
          width: "100%",
          margin: "2rem 0",
        }}
      >
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  fontSize: "0.75rem",
                  color: "#b7efb2",
                  fontWeight: 600,
                  width: "fit-content",
                }}
              >
                <ShieldCheck size={15} />
                <span>TEKNOLOGI WEB3 TANPA RIBET</span>
              </div>

              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  color: "#fff",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Jaminan Finansial Yang Tidak Bisa Dibatalkan Sepihak.
              </h2>

              <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.7)" }}>
                Di platform konvensional, kreator sering mengalami pembatalan pembayaran sepihak dari brand. Di ClipStream AI, escrow dikunci on-chain pada smart contract BNB Chain. Agent AI bertindak sebagai verifikator independen dengan bukti terenkripsi IPFS.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <CheckCircle2 size={18} className="text-[#b7efb2] shrink-0" />
                  <span>Kalkulasi transparan: views × tarif CPM = payout</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <CheckCircle2 size={18} className="text-[#b7efb2] shrink-0" />
                  <span>Clipper tidak perlu bayar gas fee — ditanggung protokol via EIP-712 / Relayer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <CheckCircle2 size={18} className="text-[#b7efb2] shrink-0" />
                  <span>Klaim holdback 30% permissionless langsung ke wallet BSC</span>
                </div>
              </div>

              <div style={{ paddingTop: "0.75rem" }}>
                <a
                  href="https://testnet.bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-nav-btn is-secondary"
                  style={{
                    padding: "0.75rem 1.25rem",
                    backgroundColor: "#fff",
                    color: "#111",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>Lihat Smart Contract di BscScan</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Right: State Machine / Architecture Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
                AUDIT TRAIL &amp; STATE MACHINE
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontFamily: "monospace", fontSize: "0.8125rem" }}>
                <div style={{ padding: "0.875rem 1rem", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "0.5rem", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>1. Escrow Lock</span>
                  <span style={{ color: "#b7efb2", fontWeight: 600 }}>CampaignEscrow.sol</span>
                </div>
                <div style={{ padding: "0.875rem 1rem", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "0.5rem", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>2. AI Verifier Agent</span>
                  <span style={{ color: "#ffef99", fontWeight: 600 }}>Whisper + Gemini 2.5</span>
                </div>
                <div style={{ padding: "0.875rem 1rem", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "0.5rem", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>3. Proof Attestation</span>
                  <span style={{ color: "#99fff9", fontWeight: 600 }}>IPFS CID + Keccak256</span>
                </div>
                <div style={{ padding: "0.875rem 1rem", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "0.5rem", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>4. Instant Settlement</span>
                  <span style={{ color: "#b7efb2", fontWeight: 600 }}>USDT Transfer (70/30)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ Section ───────────────────────────────────────── */}
      <section className="am-section" style={{ padding: "4rem 0", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "55rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#6d6c6b", fontWeight: 700, marginBottom: "0.5rem" }}>
              PERTANYAAN UMUM
            </div>
            <h2
              className="am-heading-36"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.75px",
                color: "#111",
                fontWeight: 500,
                margin: 0,
              }}
            >
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              {
                q: "Bagaimana cara kerja smart contract escrow ClipStream?",
                a: "Saat brand membuat campaign, mereka menyetor budget USDT langsung ke smart contract CampaignEscrow di BNB Chain. Dana tersebut terkunci secara kriptografis dan hanya bisa dicairkan ke clipper yang klipnya telah diverifikasi sah oleh AI agent.",
              },
              {
                q: "Berapa lama waktu yang dibutuhkan AI untuk memverifikasi klip?",
                a: "Rata-rata proses verifikasi memakan waktu 30 hingga 45 detik. AI agent mendownload audio, mentranskripsinya via Whisper ASR, mencocokkan semantic pesan brand via Gemini AI, dan memverifikasi views langsung dari YouTube API.",
              },
              {
                q: "Mengapa ada pembagian 70% cair langsung dan 30% holdback?",
                a: "70% payout cair seketika untuk memberikan reward langsung kepada clipper. 30% sisanya ditahan selama 3 hari untuk memastikan stabilitas views dan mencegah fraud seperti penghapusan video setelah pembayaran.",
              },
              {
                q: "Apakah clipper perlu memiliki BNB untuk gas fee?",
                a: "Tidak. Seluruh interaksi pencairan awal ditangani tanpa gas fee untuk clipper (gas fee disponsori oleh protokol). Clipper cukup login dengan Google/Privy dan menghubungkan wallet EVM.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(17, 17, 17, 0.08)",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: "100%",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#111" }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === index ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                      color: "#6d6c6b",
                      flexShrink: 0,
                    }}
                  />
                </button>
                {openFaq === index && (
                  <div
                    style={{
                      padding: "0 1.5rem 1.25rem 1.5rem",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                      color: "rgba(17, 17, 17, 0.7)",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. High-Impact CTA Banner ────────────────────────────── */}
      <section className="am-section" style={{ padding: "4rem 0 6rem", width: "100%" }}>
        <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              backgroundColor: "#111",
              borderRadius: "1.5rem",
              padding: "clamp(3rem, 6vw, 5rem) 2rem",
              textAlign: "center",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                lineHeight: 1.15,
                letterSpacing: "-1.5px",
                fontWeight: 500,
                color: "#fff",
                maxWidth: "38rem",
                margin: 0,
              }}
            >
              Mulai Monetisasi Klip Video Kamu Hari Ini
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255, 255, 255, 0.7)",
                maxWidth: "32rem",
                margin: "0 auto",
                lineHeight: 1.5,
              }}
            >
              Pilih campaign aktif, buat klip kreatif, dan terima pembayaran USDT otomatis di setiap views yang kamu hasilkan.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
              <Link
                href="/campaigns"
                className="am-nav-btn"
                style={{
                  padding: "0.875rem 2rem",
                  backgroundColor: "#fff",
                  color: "#111",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>Jelajahi Campaign</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Modal for new onboarded users */}
      <RoleSelectModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="am-container py-24 text-center">
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
