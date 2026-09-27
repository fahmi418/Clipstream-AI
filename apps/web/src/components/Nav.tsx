"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { usePrivy } from "@/lib/privy-safe";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import { RoleSelectModal } from "@/components/RoleSelectModal";
import {
  Video,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  CheckCircle2,
  ExternalLink,
  Layers,
  LogOut,
  User,
  Plus,
  Compass,
  Scissors,
  Megaphone,
  ShieldAlert,
  ArrowRight,
  Bot,
  Sliders,
  Check,
  X,
  Flame,
  Wallet,
  Rocket,
  BookOpen,
} from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const { login: privyLogin, authenticated, logout: privyLogout } = usePrivy();
  const { user, logout: authLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeProductTab, setActiveProductTab] = useState<string>("ai-verifier");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("clipstream_user_role");
      localStorage.removeItem("clipstream_auth_token");
    }
    try {
      if (authenticated) {
        await privyLogout();
      }
      await authLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    window.location.href = "/";
  };

  // Determine user login status and destination dashboard
  const isLoggedIn = Boolean(user);
  const userRole = user?.role || "CLIPPER";
  const dashboardHref =
    userRole === "ADMIN"
      ? "/admin/appeals"
      : userRole === "BRAND"
      ? "/brand/campaigns"
      : "/clipper";
  const dashboardLabel =
    userRole === "ADMIN"
      ? "Portal Superadmin"
      : userRole === "BRAND"
      ? "Dashboard Brand"
      : "Dashboard Clipper";

  return (
    <>
      <div
        className="am-navbar-wrapper"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <nav
          className="am-section is-navbar"
          style={{ width: "100%", pointerEvents: "auto" }}
        >
          <div className="am-container" ref={navRef}>
            <div
              data-color-mode="light"
              className={`am-nav-content-wrapper ${
                mobileMenuOpen ? "is-menu-open" : ""
              }`}
            >
              <div
                className={`am-nav-content is-big ${
                  scrolled ? "is-minified" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  maxWidth: "70rem",
                  width: "100%",
                  padding: "0.35rem 0.5rem 0.35rem 1.125rem",
                  borderRadius: "9999px",
                  boxSizing: "border-box",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0, 0, 0, 0.07)",
                }}
              >
                {/* Left Side: Logo & Main Navigation Links */}
                <div
                  className="am-nav-content-left"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    flexShrink: 0,
                  }}
                >
                  <Link
                    href="/"
                    aria-current="page"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      marginRight: "0.5rem",
                    }}
                  >
                    <Logo theme="light" width={145} height={32} />
                  </Link>

                  {/* Desktop Dropdowns & Navigation (No Dashboard links here for public) */}
                  <div
                    className="hidden lg:flex items-center"
                    style={{ gap: "0.35rem" }}
                  >
                    {/* 1. PRODUK DROPDOWN */}
                    <div
                      style={{ position: "relative", overflow: "visible" }}
                      onMouseEnter={() => setActiveDropdown("product")}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDropdown("product")}
                        className="am-nav-link"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: activeDropdown === "product" ? "#111" : "rgba(17,17,17,0.7)",
                          borderRadius: "9999px",
                          backgroundColor:
                            activeDropdown === "product" ? "rgba(17,17,17,0.05)" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>Produk</span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: activeDropdown === "product" ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>

                      {/* Dropdown Menu Box */}
                      {activeDropdown === "product" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            paddingTop: "0.5rem",
                            zIndex: 99999,
                            overflow: "visible",
                          }}
                        >
                          <div
                            style={{
                              width: "36rem",
                              backgroundColor: "#ffffff",
                              borderRadius: "20px",
                              border: "1px solid rgba(17,17,17,0.08)",
                              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                              padding: "0.75rem",
                              display: "grid",
                              gridTemplateColumns: "1.4fr 1fr",
                              gap: "0.75rem",
                              animation: "fade-in-up 0.18s ease-out",
                            }}
                          >
                            {/* Left: Product List */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {/* Feature 1 */}
                              <div
                                onMouseEnter={() => setActiveProductTab("ai-verifier")}
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                  padding: "0.625rem 0.75rem",
                                  borderRadius: "12px",
                                  backgroundColor:
                                    activeProductTab === "ai-verifier"
                                      ? "rgba(17,17,17,0.04)"
                                      : "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.625rem",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    backgroundColor: "#fff0ec",
                                    color: "#e8400d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  <Bot size={17} />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: "#111",
                                    }}
                                  >
                                    AI Verifier Pipeline
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "rgba(17,17,17,0.6)",
                                      lineHeight: 1.35,
                                      marginTop: "2px",
                                    }}
                                  >
                                    Whisper deteksi audio &amp; Gemini Vision verifikasi views otomatis.
                                  </div>
                                </div>
                              </div>

                              {/* Feature 2 */}
                              <div
                                onMouseEnter={() => setActiveProductTab("escrow")}
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                  padding: "0.625rem 0.75rem",
                                  borderRadius: "12px",
                                  backgroundColor:
                                    activeProductTab === "escrow"
                                      ? "rgba(17,17,17,0.04)"
                                      : "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.625rem",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    backgroundColor: "#ecfdf5",
                                    color: "#059669",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  <ShieldCheck size={17} />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: "#111",
                                    }}
                                  >
                                    Smart Contract Escrow
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "rgba(17,17,17,0.6)",
                                      lineHeight: 1.35,
                                      marginTop: "2px",
                                    }}
                                  >
                                    Budget terkunci di BNB Chain, cair otomatis tanpa invoice manual.
                                  </div>
                                </div>
                              </div>

                              {/* Feature 3 */}
                              <div
                                onMouseEnter={() => setActiveProductTab("cpm-engine")}
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                  padding: "0.625rem 0.75rem",
                                  borderRadius: "12px",
                                  backgroundColor:
                                    activeProductTab === "cpm-engine"
                                      ? "rgba(17,17,17,0.04)"
                                      : "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.625rem",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    backgroundColor: "#fffbeb",
                                    color: "#d97706",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  <TrendingUp size={17} />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: "#111",
                                    }}
                                  >
                                    CPM Dynamic Engine
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "rgba(17,17,17,0.6)",
                                      lineHeight: 1.35,
                                      marginTop: "2px",
                                    }}
                                  >
                                    Tarif transparan Rp 15.000 - Rp 35.000 per 1k views terverifikasi.
                                  </div>
                                </div>
                              </div>

                              {/* Feature 4 */}
                              <div
                                onMouseEnter={() => setActiveProductTab("anti-sybil")}
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                  padding: "0.625rem 0.75rem",
                                  borderRadius: "12px",
                                  backgroundColor:
                                    activeProductTab === "anti-sybil"
                                      ? "rgba(17,17,17,0.04)"
                                      : "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.625rem",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f5f3ff",
                                    color: "#7c3aed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  <Layers size={17} />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: "#111",
                                    }}
                                  >
                                    Anti-Spoof Shield
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "rgba(17,17,17,0.6)",
                                      lineHeight: 1.35,
                                      marginTop: "2px",
                                    }}
                                  >
                                    Proteksi duplikasi klip dan verifikasi kepemilikan video kreator.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Interactive Feature Highlight Box */}
                            <div
                              style={{
                                backgroundColor: "#fbfaf9",
                                borderRadius: "14px",
                                padding: "1rem",
                                border: "1px solid rgba(17,17,17,0.06)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.6875rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.6px",
                                    color:
                                      activeProductTab === "ai-verifier"
                                        ? "#e8400d"
                                        : activeProductTab === "escrow"
                                        ? "#059669"
                                        : activeProductTab === "cpm-engine"
                                        ? "#d97706"
                                        : "#7c3aed",
                                    textTransform: "uppercase",
                                    marginBottom: "0.35rem",
                                  }}
                                >
                                  {activeProductTab === "ai-verifier" && "AI MULTI-MODAL PIPELINE"}
                                  {activeProductTab === "escrow" && "BNB CHAIN SMART CONTRACT"}
                                  {activeProductTab === "cpm-engine" && "TRANSPARENT VALUE ENGINE"}
                                  {activeProductTab === "anti-sybil" && "SYBIL RESISTANT PROTOCOL"}
                                </div>
                                <h4
                                  style={{
                                    fontSize: "0.9375rem",
                                    fontWeight: 600,
                                    color: "#111",
                                    marginBottom: "0.35rem",
                                  }}
                                >
                                  {activeProductTab === "ai-verifier" && "Verifikasi Akurat 99.8%"}
                                  {activeProductTab === "escrow" && "Pencairan USDT Seketika"}
                                  {activeProductTab === "cpm-engine" && "Rate Kompetitif per View"}
                                  {activeProductTab === "anti-sybil" && "Tanpa Bot & Akun Palsu"}
                                </h4>
                                <p
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(17,17,17,0.65)",
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {activeProductTab === "ai-verifier" &&
                                    "Menggunakan integrasi Whisper OpenAI untuk transkripsi audio sponsor dan Gemini Vision untuk mendeteksi watermark visual secara real-time."}
                                  {activeProductTab === "escrow" &&
                                    "Dana kampanye diamankan di smart contract BNB Chain. Payout ditransfer langsung ke wallet clipper tanpa campur tangan pihak ketiga."}
                                  {activeProductTab === "cpm-engine" &&
                                    "Perhitungan views terstandarisasi memastikan brand hanya membayar untuk views asli yang telah divalidasi sistem."}
                                  {activeProductTab === "anti-sybil" &&
                                    "Setiap video klip memiliki cryptographic hash unik di IPFS sehingga klip curian atau upload ganda otomatis ditolak."}
                                </p>
                              </div>

                              <Link
                                href="/campaigns"
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "#111",
                                  textDecoration: "none",
                                  marginTop: "0.75rem",
                                  padding: "0.5rem 0.75rem",
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(17,17,17,0.08)",
                                  boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                                }}
                              >
                                <span>Jelajahi Marketplace Kampanye</span>
                                <ArrowRight size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. SOLUSI DROPDOWN */}
                    <div
                      style={{ position: "relative", overflow: "visible" }}
                      onMouseEnter={() => setActiveDropdown("solutions")}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDropdown("solutions")}
                        className="am-nav-link"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: activeDropdown === "solutions" ? "#111" : "rgba(17,17,17,0.7)",
                          borderRadius: "9999px",
                          backgroundColor:
                            activeDropdown === "solutions" ? "rgba(17,17,17,0.05)" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>Solusi</span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: activeDropdown === "solutions" ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>

                      {/* Solutions Popover */}
                      {activeDropdown === "solutions" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            paddingTop: "0.5rem",
                            zIndex: 99999,
                            overflow: "visible",
                          }}
                        >
                          <div
                            style={{
                              width: "28rem",
                              backgroundColor: "#ffffff",
                              borderRadius: "20px",
                              border: "1px solid rgba(17,17,17,0.08)",
                              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                              padding: "0.75rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.35rem",
                              animation: "fade-in-up 0.18s ease-out",
                            }}
                          >
                            <Link
                              href="/clipper"
                              onClick={() => setActiveDropdown(null)}
                              style={{
                                textDecoration: "none",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                transition: "background-color 0.15s ease",
                              }}
                              className="hover:bg-slate-50"
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  backgroundColor: "#ecfdf5",
                                  color: "#059669",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Scissors size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>
                                  Untuk Clipper &amp; Editor Video
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(17,17,17,0.6)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Ubah klip video podcast jadi sumber cuan harian bergaransi.
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="/brand/campaigns"
                              onClick={() => setActiveDropdown(null)}
                              style={{
                                textDecoration: "none",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                transition: "background-color 0.15s ease",
                              }}
                              className="hover:bg-slate-50"
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  backgroundColor: "#fffbeb",
                                  color: "#d97706",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Megaphone size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>
                                  Untuk Brand &amp; Bisnis UMKM
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(17,17,17,0.6)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Dapatkan eksposur puluhan juta views tanpa repot negosiasi manual.
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="/campaigns"
                              onClick={() => setActiveDropdown(null)}
                              style={{
                                textDecoration: "none",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                transition: "background-color 0.15s ease",
                              }}
                              className="hover:bg-slate-50"
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  backgroundColor: "#eff6ff",
                                  color: "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Video size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>
                                  Untuk Podcaster &amp; Kreator Asli
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(17,17,17,0.6)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Gandakan jangkauan konten video panjang kamu secara organik.
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="/admin"
                              onClick={() => setActiveDropdown(null)}
                              style={{
                                textDecoration: "none",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                transition: "background-color 0.15s ease",
                                backgroundColor: "rgba(139, 92, 246, 0.05)",
                              }}
                              className="hover:bg-purple-100/50"
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  backgroundColor: "#f5f3ff",
                                  color: "#7c3aed",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <ShieldAlert size={18} />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#7c3aed",
                                  }}
                                >
                                  Portal Superadmin &amp; DAO
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(17,17,17,0.6)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Monitoring escrow protocol, antrean verifikasi, dan governance.
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Direct Public Link: Marketplace ONLY */}
                    <Link
                      href="/campaigns"
                      className="am-nav-link"
                      style={{
                        padding: "0.4rem 0.75rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "rgba(17,17,17,0.7)",
                        textDecoration: "none",
                        borderRadius: "9999px",
                      }}
                    >
                      Marketplace
                    </Link>
                  </div>
                </div>

                {/* Right Side: Auth & Conditional Dashboard Button */}
                <div
                  className="am-nav-content-right"
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                >
                  {/* Right Side: Account state & Action CTA */}
                  {isLoggedIn ? (
                    <>
                      {/* User Role Badge */}
                      <span
                        className="hidden md:inline-flex items-center"
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "1px solid rgba(17,17,17,0.08)",
                          backgroundColor:
                            userRole === "ADMIN"
                              ? "#f5f3ff"
                              : userRole === "BRAND"
                              ? "#fffbeb"
                              : "#ecfdf5",
                          color:
                            userRole === "ADMIN"
                              ? "#7c3aed"
                              : userRole === "BRAND"
                              ? "#d97706"
                              : "#059669",
                        }}
                      >
                        <span style={{ textTransform: "capitalize" }}>
                          {user?.displayName || (userRole === "ADMIN" ? "Superadmin" : userRole === "BRAND" ? "Brand" : "Clipper")}
                        </span>
                      </span>

                      {/* Direct Dashboard Access Button for Logged In User */}
                      <Link
                        href={dashboardHref}
                        className="am-nav-btn"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0 0.875rem",
                          height: "32px",
                          backgroundColor: "#111",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.25rem",
                          textDecoration: "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>Dashboard</span>
                        <ArrowRight size={12} />
                      </Link>

                      {/* Logout button - Desktop */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        title="Keluar akun"
                        className="hidden md:inline-flex items-center"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.4rem",
                          color: "rgba(17,17,17,0.5)",
                          borderRadius: "50%",
                          transition: "color 0.15s ease",
                        }}
                      >
                        <LogOut size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Masuk Button - Desktop Only */}
                      <Link
                        href="/login"
                        className="am-nav-btn is-secondary hidden md:inline-flex"
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0 0.875rem",
                          height: "34px",
                          fontWeight: 500,
                          borderRadius: "9999px",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: "rgba(17,17,17,0.04)",
                          border: "1px solid rgba(17,17,17,0.08)",
                          color: "#111",
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Masuk
                      </Link>

                      {/* Mulai Gratis CTA Button */}
                      <Link
                        href="/register"
                        className="am-nav-btn"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0 0.875rem",
                          height: "32px",
                          backgroundColor: "#111",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: "9999px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          whiteSpace: "nowrap",
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Mulai Gratis
                      </Link>
                    </>
                  )}

                  {/* Mobile Drawer Hamburger Button */}
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="flex lg:hidden items-center justify-center p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-neutral-800"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "0.25rem",
                    }}
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <X size={20} />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ width: "20px", height: "2px", backgroundColor: "#111", borderRadius: "2px" }} />
                        <div style={{ width: "20px", height: "2px", backgroundColor: "#111", borderRadius: "2px" }} />
                        <div style={{ width: "20px", height: "2px", backgroundColor: "#111", borderRadius: "2px" }} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Floating Standalone Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[99998] transition-opacity animate-in fade-in"
          />

          {/* Floating Mobile Sheet Card */}
          <div className="fixed top-16 left-3 right-3 max-w-lg mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/10 shadow-2xl p-5 z-[99999] max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header with User Info or Quick Welcome */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <Logo theme="light" width={120} height={28} />
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Authenticated User Status Card */}
            {isLoggedIn && (
              <div className="mb-4 p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {(user?.displayName || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 truncate">
                      {user?.displayName || "Pengguna Aktif"}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">
                      {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user?.email || "Akun Terhubung"}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wider flex-shrink-0">
                  {userRole}
                </span>
              </div>
            )}

            {/* Navigation List */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                Navigasi Utama
              </div>

              <Link
                href="/campaigns"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-neutral-800 hover:bg-neutral-100/80 transition-all font-semibold text-sm no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <Flame size={18} className="text-orange-600" />
                  <span>Marketplace Kampanye</span>
                </span>
                <ArrowRight size={14} className="text-neutral-400" />
              </Link>

              <Link
                href="/clipper"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-neutral-800 hover:bg-neutral-100/80 transition-all font-semibold text-sm no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <Scissors size={18} className="text-orange-600" />
                  <span>Clipper Studio</span>
                </span>
                <ArrowRight size={14} className="text-neutral-400" />
              </Link>

              <Link
                href="/clipper/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-emerald-800 bg-emerald-50/60 hover:bg-emerald-50 transition-all font-semibold text-sm no-underline border border-emerald-100"
              >
                <span className="flex items-center gap-2.5">
                  <Wallet size={18} className="text-emerald-600" />
                  <span>Dompet &amp; Penarikan Poko</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Instan
                </span>
              </Link>

              <Link
                href="/brand/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-neutral-800 hover:bg-neutral-100/80 transition-all font-semibold text-sm no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <Rocket size={18} className="text-sky-600" />
                  <span>Pasang Bounty Brand</span>
                </span>
                <ArrowRight size={14} className="text-neutral-400" />
              </Link>

              <Link
                href="/admin/ai-monitoring"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-neutral-800 hover:bg-neutral-100/80 transition-all font-semibold text-sm no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <Bot size={18} className="text-violet-600" />
                  <span>Observabilitas AI &amp; Token</span>
                </span>
                <ArrowRight size={14} className="text-neutral-400" />
              </Link>

              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-neutral-800 hover:bg-neutral-100/80 transition-all font-semibold text-sm no-underline"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={18} className="text-neutral-600" />
                  <span>Blog &amp; Panduan Komunitas</span>
                </span>
                <ArrowRight size={14} className="text-neutral-400" />
              </Link>
            </div>

            {/* Auth Actions: Logged In vs Logged Out */}
            {isLoggedIn ? (
              <div className="pt-3 border-t border-black/5 flex flex-col gap-2">
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white font-bold text-sm text-center flex items-center justify-center gap-2 no-underline shadow-md shadow-black/10"
                >
                  <span>Buka {dashboardLabel}</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-red-200/60 transition-all"
                >
                  <LogOut size={14} />
                  <span>Keluar Akun ({user?.displayName || "Saya"})</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-black/5 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/70 text-neutral-800 font-bold text-xs text-center no-underline border border-black/5"
                >
                  Masuk ke Akun
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 rounded-xl bg-neutral-900 text-white font-bold text-xs text-center no-underline flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Mulai Gratis</span>
                  <Rocket size={13} />
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Role Selection & Login Modal */}
      <RoleSelectModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </>
  );
}
