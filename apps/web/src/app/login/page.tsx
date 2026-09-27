"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Scissors,
  Megaphone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/api";
import { requestAccounts, getInjectedProvider } from "@/lib/wallet-helper";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const initialRole = (searchParams.get("role") as UserRole) || "CLIPPER";

  const { user, isAuthenticated, login, loginWithWallet, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"wallet" | "email">("email");
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Wallet form state
  const [manualWallet, setManualWallet] = useState("");
  const [hasEthereum, setHasEthereum] = useState(false);
  const [showManualWallet, setShowManualWallet] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: unknown }).ethereum) {
      setHasEthereum(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isAuthLoading) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role === "BRAND") {
        router.push("/brand/campaigns");
      } else if (user.role === "ADMIN") {
        router.push("/admin/appeals");
      } else {
        router.push("/clipper");
      }
    }
  }, [isAuthenticated, user, isAuthLoading, redirectUrl, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Harap isi email dan kata sandi Anda.");
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login({ email, password });
      setSuccessMsg(`Selamat datang kembali, ${loggedUser.displayName || "User"}!`);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (loggedUser.role === "BRAND") {
          router.push("/brand/campaigns");
        } else if (loggedUser.role === "ADMIN") {
          router.push("/admin/appeals");
        } else {
          router.push("/clipper");
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk. Periksa email dan password Anda.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      let address = manualWallet.trim();

      const provider = getInjectedProvider();
      if (provider) {
        const accounts = await requestAccounts();
        if (!accounts || accounts.length === 0) {
          throw new Error("Tidak ada akun Web3 wallet (Trust Wallet / MetaMask) yang dipilih.");
        }
        address = accounts[0];
      } else {
        if (!address) {
          throw new Error(
            "Browser wallet tidak terdeteksi. Jika di HP, silakan buka link ini melalui DApp Browser di aplikasi Trust Wallet, atau masukkan alamat wallet BSC (0x...) Anda di bawah."
          );
        }
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error("Alamat wallet tidak valid. Harus format EVM (0x...)");
      }

      const loggedUser = await loginWithWallet({
        walletAddress: address,
        role: selectedRole,
      });

      setSuccessMsg(`Terhubung dengan wallet ${address.slice(0, 6)}...${address.slice(-4)}`);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (loggedUser.role === "BRAND") {
          router.push("/brand/campaigns");
        } else if (loggedUser.role === "ADMIN") {
          router.push("/admin/appeals");
        } else {
          router.push("/clipper");
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungkan wallet.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoWalletLogin = async (role: UserRole, address: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedRole(role);
    setManualWallet(address);

    try {
      setLoading(true);
      const loggedUser = await loginWithWallet({
        walletAddress: address,
        role,
      });

      setSuccessMsg(`Terhubung sebagai ${role === "CLIPPER" ? "Clipper" : "Brand"} Demo (${address.slice(0, 6)}...${address.slice(-4)})`);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (loggedUser.role === "BRAND") {
          router.push("/brand/campaigns");
        } else if (loggedUser.role === "ADMIN") {
          router.push("/admin/appeals");
        } else {
          router.push("/clipper");
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal demo login.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#f6f5f3",
        paddingTop: "6.5rem",
        paddingBottom: "4rem",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
          padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
          boxSizing: "border-box",
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.025em",
              margin: "0 0 0.35rem 0",
              lineHeight: 1.25,
            }}
          >
            Masuk ke Akun
          </h1>
          <div
            style={{
              fontSize: "0.875rem",
              color: "#666666",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Akses dashboard Clipper atau Brand Anda.
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "3px",
            backgroundColor: "#f0eeea",
            borderRadius: "10px",
            gap: "2px",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("email");
              setErrorMsg(null);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: activeTab === "email" ? "#ffffff" : "transparent",
              color: activeTab === "email" ? "#111111" : "#777777",
              boxShadow: activeTab === "email" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Email &amp; Sandi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("wallet");
              setErrorMsg(null);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: activeTab === "wallet" ? "#ffffff" : "transparent",
              color: activeTab === "wallet" ? "#111111" : "#777777",
              boxShadow: activeTab === "wallet" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Web3 Wallet
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Web3 Wallet Login */}
        {activeTab === "wallet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 1-Click Demo Accounts Selector for Web3 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Zap size={11} /> Akun Demo Siap Pakai (1-Klik)
                </span>
                <span style={{ fontSize: "0.625rem", color: "#059669", fontWeight: 700, backgroundColor: "#ecfdf5", padding: "1px 6px", borderRadius: "9999px" }}>
                  Auto-Login
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoWalletLogin("CLIPPER", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: selectedRole === "CLIPPER" ? "#fff8f5" : "#ffffff",
                    border: selectedRole === "CLIPPER" ? "1px solid #e8400d" : "1px solid rgba(0,0,0,0.1)",
                    color: selectedRole === "CLIPPER" ? "#e8400d" : "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <Scissors size={13} /> Clipper Demo
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoWalletLogin("BRAND", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: selectedRole === "BRAND" ? "#f0f6ff" : "#ffffff",
                    border: selectedRole === "BRAND" ? "1px solid #2563eb" : "1px solid rgba(0,0,0,0.1)",
                    color: selectedRole === "BRAND" ? "#2563eb" : "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <Megaphone size={13} /> Brand Demo
                </button>
              </div>
            </div>

            {/* Role selection toggle for wallet login */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.5rem",
                }}
              >
                Pilih Peran Utama
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedRole("CLIPPER")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: selectedRole === "CLIPPER" ? "2px solid #e8400d" : "2px solid #e2e8f0",
                    backgroundColor: selectedRole === "CLIPPER" ? "#fff8f5" : "#faf9f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: selectedRole === "CLIPPER" ? "rgba(232, 64, 13, 0.1)" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Scissors size={15} style={{ color: selectedRole === "CLIPPER" ? "#e8400d" : "#64748b" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                      Clipper
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "2px" }}>
                      Hasilkan USDC
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("BRAND")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: selectedRole === "BRAND" ? "2px solid #2563eb" : "2px solid #e2e8f0",
                    backgroundColor: selectedRole === "BRAND" ? "#f0f6ff" : "#faf9f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: selectedRole === "BRAND" ? "rgba(37, 99, 235, 0.1)" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Megaphone size={15} style={{ color: selectedRole === "BRAND" ? "#2563eb" : "#64748b" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                      Brand
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "2px" }}>
                      Buat Kampanye
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Browser Wallet Connect CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                type="button"
                disabled={loading}
                onClick={handleConnectWallet}
                style={{
                  width: "100%",
                  height: "46px",
                  minHeight: "46px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxSizing: "border-box",
                  appearance: "none",
                  WebkitAppearance: "none",
                  transition: "background-color 0.15s ease",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Wallet size={16} />
                    <span>Hubungkan Wallet Browser</span>
                    <ArrowRight size={15} style={{ marginLeft: "2px" }} />
                  </>
                )}
              </button>
              <div style={{ fontSize: "0.75rem", textAlign: "center", color: "#64748b", lineHeight: 1.4 }}>
                Mendukung MetaMask, Rabby, Coinbase Wallet, dan browser EVM
              </div>
            </div>

            {/* Collapsible / Manual EVM Address Option */}
            <div style={{ marginTop: "0.25rem" }}>
              <button
                type="button"
                onClick={() => setShowManualWallet(!showManualWallet)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "4px 0",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>{showManualWallet ? "Sembunyikan alamat manual" : "Atau masukkan alamat EVM manual"}</span>
                {showManualWallet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showManualWallet && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Alamat EVM Publik (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    disabled={loading || !manualWallet.trim()}
                    onClick={handleConnectWallet}
                    style={{
                      width: "100%",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: manualWallet.trim() ? "#0f172a" : "#cbd5e1",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: manualWallet.trim() && !loading ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Masuk dengan Alamat</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Non-custodial Security Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "0.6875rem",
                color: "#64748b",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#059669", flexShrink: 0 }} />
              <span>Non-custodial, kami tidak pernah meminta private key</span>
            </div>
          </div>
        )}

        {/* Tab 2: Email & Password Login */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* 1-Click Demo Accounts Selector */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                marginBottom: "2px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Zap size={11} /> Akun Demo Siap Pakai (1-Klik)
                </span>
                <span style={{ fontSize: "0.625rem", color: "#059669", fontWeight: 700, backgroundColor: "#ecfdf5", padding: "1px 6px", borderRadius: "9999px" }}>
                  Auto-Fill
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("budi@clipper.id");
                    setPassword("password123");
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: email === "budi@clipper.id" ? "#fff8f5" : "#ffffff",
                    border: email === "budi@clipper.id" ? "1px solid #e8400d" : "1px solid rgba(0,0,0,0.1)",
                    color: email === "budi@clipper.id" ? "#e8400d" : "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Scissors size={13} /> Clipper Demo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("brand@podcastbincang.id");
                    setPassword("password123");
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: email === "brand@podcastbincang.id" ? "#f0f6ff" : "#ffffff",
                    border: email === "brand@podcastbincang.id" ? "1px solid #2563eb" : "1px solid rgba(0,0,0,0.1)",
                    color: email === "brand@podcastbincang.id" ? "#2563eb" : "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Megaphone size={13} /> Brand Demo
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                Alamat Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 36px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.14)",
                    backgroundColor: "#ffffff",
                    fontSize: "0.875rem",
                    color: "#111111",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                Kata Sandi
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 34px 0 36px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.14)",
                    backgroundColor: "#ffffff",
                    fontSize: "0.875rem",
                    color: "#111111",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.35rem",
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#111111",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "opacity 0.15s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Card Navigation */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "#666666",
          }}
        >
          Belum memiliki akun Clipstream?{" "}
          <Link
            href={`/register${initialRole ? `?role=${initialRole}` : ""}`}
            style={{ color: "#e8400d", fontWeight: 700, textDecoration: "none" }}
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f5f3] flex items-center justify-center"><Loader2 className="animate-spin text-[#e8400d]" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
