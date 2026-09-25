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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/api";

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

      const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
      if (eth) {
        const accounts = await eth.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("Tidak ada akun Web3 wallet yang dipilih.");
        }
        address = accounts[0];
      } else {
        if (!address) {
          throw new Error(
            "Browser wallet tidak terdeteksi. Silakan masukkan alamat wallet EVM Anda secara manual."
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
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666666",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Akses dashboard Clipper atau Brand Anda.
          </p>
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
          <div className="space-y-4">
            {/* Role selection toggle for wallet login */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
                Pilih Peran Utama
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("CLIPPER")}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedRole === "CLIPPER"
                      ? "border-[#e8400d] bg-[#fff8f5] ring-1 ring-[#e8400d]"
                      : "border-black/[0.08] bg-[#faf9f6] hover:border-black/20"
                  }`}
                >
                  <Scissors size={16} className={selectedRole === "CLIPPER" ? "text-[#e8400d]" : "text-[#777]"} />
                  <div>
                    <div className="text-xs font-bold text-[#111111]">Clipper</div>
                    <div className="text-[10px] text-[#777777]">Hasilkan USDC</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("BRAND")}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedRole === "BRAND"
                      ? "border-[#2563eb] bg-[#f0f6ff] ring-1 ring-[#2563eb]"
                      : "border-black/[0.08] bg-[#faf9f6] hover:border-black/20"
                  }`}
                >
                  <Megaphone size={16} className={selectedRole === "BRAND" ? "text-[#2563eb]" : "text-[#777]"} />
                  <div>
                    <div className="text-xs font-bold text-[#111111]">Brand</div>
                    <div className="text-[10px] text-[#777777]">Buat Kampanye</div>
                  </div>
                </button>
              </div>
            </div>

            {hasEthereum ? (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConnectWallet}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.005] active:scale-[0.995] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={18} />
                      <span>Hubungkan Wallet Browser</span>
                      <ArrowRight size={16} className="ml-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#777777] mt-2">
                  Mendukung MetaMask, Rabby, Coinbase Wallet, dan browser EVM
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  Ekstensi Web3 wallet tidak terdeteksi. Silakan masukkan alamat wallet EVM publik Anda di bawah:
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1.5">
                    Alamat Wallet EVM (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fcfbf9] border border-black/[0.12] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:bg-white focus:outline-none focus:border-[#e8400d] focus:ring-2 focus:ring-[#e8400d]/10 transition-all font-mono"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConnectWallet}
                  className="w-full py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Masuk dengan Alamat</span>}
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 justify-center text-[11px] text-[#777777] pt-2 border-t border-black/[0.06]">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Non-custodial, kami tidak pernah meminta private key</span>
            </div>
          </div>
        )}

        {/* Tab 2: Email & Password Login */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
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
